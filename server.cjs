const express  = require("express");
const cors     = require("cors");
const { PrismaClient } = require("@prisma/client");
const { PlaidApi, PlaidEnvironments, Configuration, Products, CountryCode } = require("plaid");

const prisma = new PrismaClient();
const app    = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── Log every request ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} — ${new Date().toISOString()}`);
  if (req.method === "POST" && req.path === "/api/data") {
    console.log(`  POST /api/data — txns:${req.body?.transactions?.length ?? "?"} accounts:${req.body?.accounts?.length ?? "?"}`);
    console.log(`  Origin: ${req.headers.origin || "unknown"}`);
  }
  next();
});

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

const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

const plaidDescription = (t) =>
  t.original_description || t.merchant_name || t.name || "";

const toLedgerTxn = (t, sourceId) => ({
  id:                   `plaid-${t.transaction_id}`,
  plaidTransactionId:    t.transaction_id,
  pendingTransactionId:  t.pending_transaction_id || null,
  date:                 t.date,
  description:          plaidDescription(t),
  originalDescription:  t.original_description || null,
  merchantName:         t.merchant_name || null,
  plaidName:            t.name || null,
  pending:              !!t.pending,
  amount:               -(t.amount),
  accountId:            null,
  sourceId,
  reconciled:           false,
  excluded:             false,
  splits:               null,
});

async function fetchRecentPlaidTransactions(pa, sourceId, days = 30) {
  const recent = [];
  let offset = 0;
  const count = 500;
  let total = Infinity;
  while (offset < total) {
    const response = await plaid.transactionsGet({
      access_token: pa.accessToken,
      start_date: daysAgo(days),
      end_date: today(),
      options: {
        account_ids: [pa.plaidAccountId],
        count,
        offset,
        include_original_description: true,
      },
    });
    total = response.data.total_transactions;
    recent.push(...response.data.transactions.map(t => toLedgerTxn(t, sourceId)));
    offset += response.data.transactions.length;
    if (!response.data.transactions.length) break;
  }
  return recent;
}

async function ensurePlaidBalanceColumns() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "PlaidAccount" ADD COLUMN IF NOT EXISTS "balanceCurrent" FLOAT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "PlaidAccount" ADD COLUMN IF NOT EXISTS "balanceAvailable" FLOAT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "PlaidAccount" ADD COLUMN IF NOT EXISTS "balanceUpdatedAt" TIMESTAMPTZ`
  );
}

async function ensureTransactionColumns() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "reconciledAccts" TEXT[] DEFAULT '{}'`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "plaidTransactionId" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "pendingTransactionId" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "originalDescription" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "merchantName" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "plaidName" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "pending" BOOLEAN DEFAULT false`
  );
}

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

app.post("/api/plaid/exchange-token", async (req, res) => {
  try {
    const { public_token } = req.body;
    const exchange = await plaid.itemPublicTokenExchange({ public_token });
    const accessToken = exchange.data.access_token;
    const itemId      = exchange.data.item_id;
    const acctRes = await plaid.accountsGet({ access_token: accessToken });
    const plaidAccounts = acctRes.data.accounts;
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

app.post("/api/plaid/sync", async (req, res) => {
  try {
    const { plaidAccountId } = req.body;
    const pa = await prisma.plaidAccount.findUnique({ where: { plaidAccountId } });
    if (!pa) return res.status(404).json({ error: "Plaid account not found" });
    let cursor = pa.cursor || "";
    let added  = [], modified = [], removed = [], hasMore = true;
    while (hasMore) {
      const syncRes = await plaid.transactionsSync({
        access_token: pa.accessToken,
        cursor: cursor || undefined,
        options: { include_original_description: true },
      });
      const data = syncRes.data;
      added    = [...added,    ...(data.added || [])];
      modified = [...modified, ...(data.modified || [])];
      removed  = [...removed,  ...(data.removed || [])];
      hasMore  = data.has_more;
      cursor   = data.next_cursor;
    }
    await prisma.plaidAccount.update({ where: { plaidAccountId }, data: { cursor } });
    const sourceId = pa.mappedToId || plaidAccountId;
    const txns = added.map(t => toLedgerTxn(t, sourceId));
    const modifiedTxns = modified.map(t => toLedgerTxn(t, sourceId));
    let recentTxns = [];
    try {
      recentTxns = await fetchRecentPlaidTransactions(pa, sourceId, 30);
    } catch (lookbackErr) {
      console.warn(`30-day Plaid lookback failed for ${plaidAccountId}:`, lookbackErr.response?.data || lookbackErr.message);
    }
    console.log(`  Plaid sync: ${txns.length} new, ${modifiedTxns.length} modified, ${recentTxns.length} recent txns for ${plaidAccountId}`);
    res.json({
      ok: true,
      added: txns,
      modified: modifiedTxns,
      removed: removed.map(t => `plaid-${t.transaction_id}`),
      recent: recentTxns,
      modifiedCount: modifiedTxns.length,
      removedCount: removed.length,
    });
  } catch (e) {
    console.error("Plaid sync error:", e.response?.data || e.message);
    const errorCode = e.response?.data?.error_code || null;
    res.status(500).json({
      error: e.response?.data?.error_message || e.message,
      errorCode,
    });
  }
});

app.get("/api/plaid/accounts", async (req, res) => {
  try {
    await ensurePlaidBalanceColumns().catch(e => console.warn("PlaidAccount balance migration skipped:", e.message));
    const accounts = await prisma.$queryRawUnsafe(
      `SELECT "plaidAccountId", name, mask, type, subtype, cursor, "mappedToId", "balanceCurrent", "balanceAvailable", "balanceUpdatedAt" FROM "PlaidAccount"`
    );
    res.json({ accounts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Plaid: fetch live balances for all mapped accounts ────────────────────────
app.get("/api/plaid/balances", async (req, res) => {
  try {
    await ensurePlaidBalanceColumns().catch(e => console.warn("PlaidAccount balance migration skipped:", e.message));
    const accounts = await prisma.plaidAccount.findMany({
      where: { mappedToId: { not: null } },
      select: { plaidAccountId: true, mappedToId: true, accessToken: true },
    });
    const balances = [];
    for (const pa of accounts) {
      try {
        const response = await plaid.accountsBalanceGet({ access_token: pa.accessToken });
        const account = response.data.accounts.find(a => a.account_id === pa.plaidAccountId);
        if (account) {
          const current   = account.balances.current;
          const available = account.balances.available;
          const updatedAt = new Date().toISOString();
          await prisma.$executeRawUnsafe(
            `UPDATE "PlaidAccount" SET "balanceCurrent" = $1, "balanceAvailable" = $2, "balanceUpdatedAt" = NOW() WHERE "plaidAccountId" = $3`,
            current, available, pa.plaidAccountId
          );
          balances.push({
            plaidAccountId: pa.plaidAccountId,
            mappedToId:     pa.mappedToId,
            current,
            available,
            name:           account.name,
            updatedAt,
          });
        }
      } catch (e) {
        console.warn(`Balance fetch failed for ${pa.plaidAccountId}:`, e.message);
      }
    }
    res.json({ balances });
  } catch (e) {
    console.error("Balance fetch error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ── Plaid: save account mapping ───────────────────────────────────────────────
app.post("/api/plaid/map", async (req, res) => {
  try {
    const { plaidAccountId, mappedToId } = req.body;
    await prisma.plaidAccount.update({ where: { plaidAccountId }, data: { mappedToId } });
    res.json({ ok: true });
  } catch (e) {
    console.error("Plaid map error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/plaid/accounts/:plaidAccountId", async (req, res) => {
  try {
    await prisma.plaidAccount.delete({ where: { plaidAccountId: req.params.plaidAccountId } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Reset reconciliations ─────────────────────────────────────────────────────
app.get("/api/reset-reconciliations", async (req, res) => {
  try {
    await prisma.$executeRawUnsafe(`UPDATE "Transaction" SET reconciled = false, "reconciledAccts" = '{}'`);
    await prisma.$executeRawUnsafe(`UPDATE "ManualJE" SET "reconciledLines" = '{}'`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Reconciliation"`);
    await prisma.setting.deleteMany({ where: { key: "reconHistory" } });
    res.json({ ok: true, message: "All reconciliations cleared" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── One-time migration ────────────────────────────────────────────────────────
app.get("/api/run-migration", async (req, res) => {
  try {
    await ensureTransactionColumns();
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ManualJE" ADD COLUMN IF NOT EXISTS "reconciledLines" TEXT[] DEFAULT '{}'`
    );
    res.json({ ok: true, message: "Columns added successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/data ─────────────────────────────────────────────────────────────
app.get("/api/data", async (req, res) => {
  try {
    // Ensure required columns exist
    try {
      await ensureTransactionColumns();
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "ManualJE" ADD COLUMN IF NOT EXISTS "reconciledLines" TEXT[] DEFAULT '{}'`
      );
    } catch(migErr) { console.warn("Migration skipped:", migErr.message); }

    // Fetch all tables in parallel
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

    console.log(`  GET /api/data — returning txns:${transactions.length} accounts:${accounts.length}`);

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
        reconciledAccts: Array.isArray(t.reconciledAccts) ? t.reconciledAccts : [],
        plaidTransactionId: t.plaidTransactionId ?? null,
        pendingTransactionId: t.pendingTransactionId ?? null,
        originalDescription: t.originalDescription ?? null,
        merchantName: t.merchantName ?? null,
        plaidName: t.plaidName ?? null,
        pending: t.pending ?? false,
        splits: t.splits ?? null,
      })),
      accounts: accounts.map(a => ({
        id: a.id, name: a.name, type: a.type, cashFlow: a.cashFlow ?? null,
        isBankFeed: a.isBankFeed, parentId: a.parentId ?? null, inactive: a.inactive,
      })),
      sources:   sources.map(s => ({ id: s.id, name: s.name })),
      rules:     rules.map(r => ({ id: r.id, pattern: r.pattern, matchType: r.matchType, accountId: r.accountId })),
      manualJEs: manualJEs.map(je => ({ id: je.id, date: je.date, memo: je.memo, lines: je.lines, reconciledLines: je.reconciledLines ?? [] })),
      reconciliations,
      excludedTxns,
      accountOrder:        settingMap["accountOrder"]        ?? null,
      reportNames:         settingMap["reportNames"]         ?? null,
      showCoaInactive:     settingMap["showCoaInactive"]     ?? false,
      reconHistory:        settingMap["reconHistory"]        ?? [],
      appThemeMode:        settingMap["appThemeMode"]        ?? null,
      customAppLightTheme: settingMap["customAppLightTheme"] ?? null,
      customAppDarkTheme:  settingMap["customAppDarkTheme"]  ?? null,
      reportThemeMode:     settingMap["reportThemeMode"]     ?? null,
      customLightTheme:    settingMap["customLightTheme"]    ?? null,
      customDarkTheme:     settingMap["customDarkTheme"]     ?? null,
      manualRecons:        settingMap["manualRecons"]         ?? {},
    });
  } catch (e) {
    console.error("GET /api/data error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/data ────────────────────────────────────────────────────────────
app.post("/api/data", async (req, res) => {
  const {
    transactions = [], accounts = [], sources = [], rules = [], manualJEs = [],
    reconciliations = {}, excludedTxns = [],
    accountOrder, reportNames, showCoaInactive, reconHistory,
    appThemeMode, customAppLightTheme, customAppDarkTheme,
    reportThemeMode, customLightTheme, customDarkTheme,
    manualRecons,
  } = req.body;

  if (transactions.length === 0 && accounts.length === 0) {
    console.log("  POST /api/data SKIPPED — empty payload");
    return res.json({ ok: true, skipped: true });
  }

  console.log(`  POST /api/data WRITING — txns:${transactions.length} accounts:${accounts.length}`);

  try {
    try { await ensureTransactionColumns(); } catch(migErr) { console.warn("Transaction metadata migration skipped:", migErr.message); }

    const excludedSet = new Set(excludedTxns);
    const t0 = Date.now();

    // Delete all in parallel
    await Promise.all([
      prisma.transaction.deleteMany(),
      prisma.account.deleteMany(),
      prisma.source.deleteMany(),
      prisma.rule.deleteMany(),
      prisma.manualJE.deleteMany(),
      prisma.reconciliation.deleteMany(),
    ]);

    // Insert all in parallel using createMany (bulk insert — much faster)
    await Promise.all([
      prisma.transaction.createMany({
        data: transactions.map(t => ({
          id: t.id, date: t.date || "", description: t.description || "",
          amount: t.amount ?? 0, accountId: t.accountId ?? null,
          sourceId: t.sourceId ?? null, transferMatchId: t.transferMatchId ?? null,
          reconciled: t.reconciled ?? false,
          reconciledAccts: Array.isArray(t.reconciledAccts) ? t.reconciledAccts : [],
          excluded: excludedSet.has(t.id) || t.excluded === true,
          plaidTransactionId: t.plaidTransactionId ?? (String(t.id || "").startsWith("plaid-") ? String(t.id).slice(6) : null),
          pendingTransactionId: t.pendingTransactionId ?? null,
          originalDescription: t.originalDescription ?? null,
          merchantName: t.merchantName ?? null,
          plaidName: t.plaidName ?? null,
          pending: t.pending ?? false,
          splits: t.splits ?? undefined,
        })),
      }),

      prisma.account.createMany({
        data: accounts.map((a, idx) => ({
          id: a.id, name: a.name, type: a.type, cashFlow: a.cashFlow ?? null,
          isBankFeed: a.isBankFeed ?? false, parentId: a.parentId ?? null,
          inactive: a.inactive ?? false,
          sortOrder: accountOrder
            ? (accountOrder.indexOf(a.id) >= 0 ? accountOrder.indexOf(a.id) : idx)
            : idx,
        })),
      }),

      prisma.source.createMany({
        data: sources.map(s => ({ id: s.id, name: s.name })),
      }),

      prisma.rule.createMany({
        data: rules.map(r => ({
          id: String(r.id), pattern: r.pattern,
          matchType: r.matchType, accountId: r.accountId,
        })),
      }),

      prisma.manualJE.createMany({
        data: manualJEs.map(je => ({
          id: je.id, date: je.date || "", memo: je.memo || "", lines: je.lines,
          reconciledLines: Array.isArray(je.reconciledLines) ? je.reconciledLines : [],
        })),
      }),

      prisma.reconciliation.createMany({
        data: Object.entries(reconciliations).map(([accountId, r]) => ({
          accountId, lastDate: r.lastDate, lastBalance: r.lastBalance,
        })),
      }),
    ]);

    // Upsert settings in parallel
    const upsert = (key, value) => prisma.setting.upsert({
      where:  { key },
      update: { value: value ?? null },
      create: { key, value: value ?? null },
    });

    await Promise.all([
      upsert("accountOrder",        accountOrder),
      upsert("reportNames",         reportNames),
      upsert("showCoaInactive",     showCoaInactive),
      upsert("reconHistory",        reconHistory ?? []),
      upsert("appThemeMode",        appThemeMode        ?? null),
      upsert("customAppLightTheme", customAppLightTheme ?? null),
      upsert("customAppDarkTheme",  customAppDarkTheme  ?? null),
      upsert("reportThemeMode",     reportThemeMode     ?? null),
      upsert("customLightTheme",    customLightTheme    ?? null),
      upsert("customDarkTheme",     customDarkTheme     ?? null),
      upsert("manualRecons",         manualRecons        ?? {}),
    ]);

    console.log(`  POST /api/data DONE in ${Date.now()-t0}ms`);
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/data error:", e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Ledger server running on port ${PORT}`));
