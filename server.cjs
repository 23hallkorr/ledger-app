const express  = require("express");
const cors     = require("cors");
const { PrismaClient } = require("@prisma/client");
const { PlaidApi, PlaidEnvironments, Configuration, Products, CountryCode } = require("plaid");

const prisma = new PrismaClient();
const app    = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── Plaid client ──────────────────────────────────────────────────────────────
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || "production"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET":    process.env.PLAID_SECRET,
    },
  },
});
const plaid = new PlaidApi(plaidConfig);

// ── Plaid: create link token ──────────────────────────────────────────────────
app.post("/api/plaid/link-token", async (req, res) => {
  try {
    const response = await plaid.linkTokenCreate({
      user: { client_user_id: "ledger-user" },
      client_name: "My Ledger",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      redirect_uri: req.body.redirectUri || undefined,
    });
    res.json({ link_token: response.data.link_token });
  } catch (e) {
    console.error("Plaid link-token error:", e.response?.data || e.message);
    res.status(500).json({ error: e.response?.data?.error_message || e.message });
  }
});

// ── Plaid: exchange public token for access token ─────────────────────────────
app.post("/api/plaid/exchange-token", async (req, res) => {
  try {
    const { public_token, accountName } = req.body;
    const exchange = await plaid.itemPublicTokenExchange({ public_token });
    const accessToken = exchange.data.access_token;
    const itemId      = exchange.data.item_id;

    // Get account details from Plaid
    const acctRes = await plaid.accountsGet({ access_token: accessToken });
    const plaidAccounts = acctRes.data.accounts;

    // Save each Plaid account to our PlaidAccount table
    const saved = [];
    for (const pa of plaidAccounts) {
      await prisma.plaidAccount.upsert({
        where:  { plaidAccountId: pa.account_id },
        update: { accessToken, itemId, name: pa.name, mask: pa.mask||"", type: pa.type, subtype: pa.subtype||"" },
        create: { plaidAccountId: pa.account_id, accessToken, itemId, name: pa.name, mask: pa.mask||"", type: pa.type, subtype: pa.subtype||"", cursor: "" },
      });
      saved.push({ plaidAccountId: pa.account_id, name: pa.name, mask: pa.mask, type: pa.type });
    }
    res.json({ ok: true, accounts: saved });
  } catch (e) {
    console.error("Plaid exchange-token error:", e.response?.data || e.message);
    res.status(500).json({ error: e.response?.data?.error_message || e.message });
  }
});

// ── Plaid: sync transactions for a given Plaid account ───────────────────────
app.post("/api/plaid/sync", async (req, res) => {
  try {
    const { plaidAccountId } = req.body;
    const pa = await prisma.plaidAccount.findUnique({ where: { plaidAccountId } });
    if (!pa) return res.status(404).json({ error: "Plaid account not found" });

    let cursor = pa.cursor || "";
    let added  = [], modified = [], hasMore = true;

    while (hasMore) {
      const syncRes = await plaid.transactionsSync({
        access_token: pa.accessToken,
        cursor: cursor || undefined,
      });
      const data = syncRes.data;
      added    = [...added,    ...data.added];
      modified = [...modified, ...data.modified];
      hasMore  = data.has_more;
      cursor   = data.next_cursor;
    }

    // Update cursor
    await prisma.plaidAccount.update({ where: { plaidAccountId }, data: { cursor } });

    // Build transactions in our format
    const txns = [
      ...added.map(t => ({
        id:          `plaid-${t.transaction_id}`,
        date:        t.date,
        description: t.merchant_name || t.name || "",
        amount:      -(t.amount), // Plaid: positive = debit, we want negative = money out
        accountId:   null,
        sourceId:    plaidAccountId,
        reconciled:  false,
        excluded:    false,
        splits:      null,
      })),
    ];

    res.json({ ok: true, added: txns, modifiedCount: modified.length });
  } catch (e) {
    console.error("Plaid sync error:", e.response?.data || e.message);
    res.status(500).json({ error: e.response?.data?.error_message || e.message });
  }
});

// ── Plaid: list connected accounts ───────────────────────────────────────────
app.get("/api/plaid/accounts", async (req, res) => {
  try {
    const accounts = await prisma.plaidAccount.findMany({
      select: { plaidAccountId:true, name:true, mask:true, type:true, subtype:true, cursor:true },
    });
    res.json({ accounts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Plaid: disconnect an account ─────────────────────────────────────────────
app.delete("/api/plaid/accounts/:plaidAccountId", async (req, res) => {
  try {
    await prisma.plaidAccount.delete({ where: { plaidAccountId: req.params.plaidAccountId } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/data
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/data", async (req, res) => {
  try {
    const [transactions, accounts, sources, rules, manualJEs, reconciliationRows, settings] =
      await Promise.all([
        prisma.transaction.findMany(),
        prisma.account.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.source.findMany(),
        prisma.rule.findMany(),
        prisma.manualJE.findMany(),
        prisma.reconciliation.findMany(),
        prisma.setting.findMany(),
      ]);

    const reconciliations = {};
    reconciliationRows.forEach(r => {
      reconciliations[r.accountId] = { lastDate: r.lastDate, lastBalance: r.lastBalance };
    });

    const excludedTxns = transactions.filter(t => t.excluded).map(t => t.id);
    const settingMap = {};
    settings.forEach(s => { settingMap[s.key] = s.value; });

    res.json({
      transactions: transactions.map(t => ({
        id: t.id, date: t.date, description: t.description, amount: t.amount,
        accountId: t.accountId ?? null, sourceId: t.sourceId ?? null,
        transferMatchId: t.transferMatchId ?? null, reconciled: t.reconciled,
        splits: t.splits ?? null,
      })),
      accounts: accounts.map(a => ({
        id: a.id, name: a.name, type: a.type, cashFlow: a.cashFlow ?? null,
        isBankFeed: a.isBankFeed, parentId: a.parentId ?? null, inactive: a.inactive,
      })),
      sources:         sources.map(s => ({ id: s.id, name: s.name })),
      rules:           rules.map(r => ({ id: r.id, pattern: r.pattern, matchType: r.matchType, accountId: r.accountId })),
      manualJEs:       manualJEs.map(je => ({ id: je.id, date: je.date, memo: je.memo, lines: je.lines })),
      reconciliations, excludedTxns,
      accountOrder:      settingMap["accountOrder"]      ?? null,
      reportNames:       settingMap["reportNames"]       ?? null,
      customTheme:       settingMap["customTheme"]       ?? null,
      customReportTheme: settingMap["customReportTheme"] ?? null,
      themeName:         settingMap["themeName"]         ?? null,
      showCoaInactive:   settingMap["showCoaInactive"]   ?? false,
      reconHistory:      settingMap["reconHistory"]      ?? [],
      themeOverrides:    settingMap["themeOverrides"]    ?? {},
      defaultThemeName:  settingMap["defaultThemeName"]  ?? null,
    });
  } catch (e) {
    console.error("GET /api/data error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/data
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/data", async (req, res) => {
  const {
    transactions = [], accounts = [], sources = [], rules = [], manualJEs = [],
    reconciliations = {}, excludedTxns = [],
    accountOrder, reportNames, customTheme, customReportTheme, themeName,
    showCoaInactive, reconHistory, themeOverrides, defaultThemeName,
  } = req.body;

  if (transactions.length === 0 && accounts.length === 0) {
    return res.json({ ok: true, skipped: true });
  }

  try {
    const excludedSet = new Set(excludedTxns);

    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.source.deleteMany();
    await prisma.rule.deleteMany();
    await prisma.manualJE.deleteMany();
    await prisma.reconciliation.deleteMany();

    for (const t of transactions) {
      await prisma.transaction.create({
        data: {
          id: t.id, date: t.date || "", description: t.description || "",
          amount: t.amount ?? 0, accountId: t.accountId ?? null,
          sourceId: t.sourceId ?? null, transferMatchId: t.transferMatchId ?? null,
          reconciled: t.reconciled ?? false, excluded: excludedSet.has(t.id),
          splits: t.splits ?? undefined,
        },
      });
    }

    for (let idx = 0; idx < accounts.length; idx++) {
      const a = accounts[idx];
      await prisma.account.create({
        data: {
          id: a.id, name: a.name, type: a.type, cashFlow: a.cashFlow ?? null,
          isBankFeed: a.isBankFeed ?? false, parentId: a.parentId ?? null,
          inactive: a.inactive ?? false,
          sortOrder: accountOrder
            ? (accountOrder.indexOf(a.id) >= 0 ? accountOrder.indexOf(a.id) : idx)
            : idx,
        },
      });
    }

    for (const s of sources) {
      await prisma.source.create({ data: { id: s.id, name: s.name } });
    }
    for (const r of rules) {
      await prisma.rule.create({
        data: { id: String(r.id), pattern: r.pattern, matchType: r.matchType, accountId: r.accountId },
      });
    }
    for (const je of manualJEs) {
      await prisma.manualJE.create({
        data: { id: je.id, date: je.date || "", memo: je.memo || "", lines: je.lines },
      });
    }
    for (const [accountId, r] of Object.entries(reconciliations)) {
      await prisma.reconciliation.create({
        data: { accountId, lastDate: r.lastDate, lastBalance: r.lastBalance },
      });
    }

    const upsert = async (key, value) => {
      await prisma.setting.upsert({
        where: { key }, update: { value: value ?? null }, create: { key, value: value ?? null },
      });
    };

    await upsert("accountOrder",      accountOrder);
    await upsert("reportNames",       reportNames);
    await upsert("customTheme",       customTheme);
    await upsert("customReportTheme", customReportTheme);
    await upsert("themeName",         themeName);
    await upsert("showCoaInactive",   showCoaInactive);
    await upsert("reconHistory",      reconHistory ?? []);
    await upsert("themeOverrides",    themeOverrides ?? {});
    await upsert("defaultThemeName",  defaultThemeName ?? null);

    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/data error:", e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Ledger server running on port ${PORT}`));
