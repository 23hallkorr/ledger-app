const express = require("express");
const cors    = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app    = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/data  — load everything from the DB
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/data", async (req, res) => {
  try {
    const [
      transactions,
      accounts,
      sources,
      rules,
      manualJEs,
      reconciliationRows,
      settings,
    ] = await Promise.all([
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
        id:              t.id,
        date:            t.date,
        description:     t.description,
        amount:          t.amount,
        accountId:       t.accountId       ?? null,
        sourceId:        t.sourceId        ?? null,
        transferMatchId: t.transferMatchId ?? null,
        reconciled:      t.reconciled,
        splits:          t.splits          ?? null,
      })),
      accounts: accounts.map(a => ({
        id:         a.id,
        name:       a.name,
        type:       a.type,
        cashFlow:   a.cashFlow   ?? null,
        isBankFeed: a.isBankFeed,
        parentId:   a.parentId   ?? null,
        inactive:   a.inactive,
      })),
      sources:         sources.map(s => ({ id: s.id, name: s.name })),
      rules:           rules.map(r => ({ id: r.id, pattern: r.pattern, matchType: r.matchType, accountId: r.accountId })),
      manualJEs:       manualJEs.map(je => ({ id: je.id, date: je.date, memo: je.memo, lines: je.lines })),
      reconciliations,
      excludedTxns,
      accountOrder:       settingMap["accountOrder"]       ?? null,
      reportNames:        settingMap["reportNames"]        ?? null,
      customTheme:        settingMap["customTheme"]        ?? null,
      customReportTheme:  settingMap["customReportTheme"]  ?? null,
      themeName:          settingMap["themeName"]          ?? null,
      showCoaInactive:    settingMap["showCoaInactive"]    ?? false,
    });
  } catch (e) {
    console.error("GET /api/data error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/data  — save everything to the DB
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/data", async (req, res) => {
  const {
    transactions   = [],
    accounts       = [],
    sources        = [],
    rules          = [],
    manualJEs      = [],
    reconciliations = {},
    excludedTxns   = [],
    accountOrder,
    reportNames,
    customTheme,
    customReportTheme,
    themeName,
    showCoaInactive,
  } = req.body;

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
          id:              t.id,
          date:            t.date            || "",
          description:     t.description     || "",
          amount:          t.amount          ?? 0,
          accountId:       t.accountId       ?? null,
          sourceId:        t.sourceId        ?? null,
          transferMatchId: t.transferMatchId ?? null,
          reconciled:      t.reconciled      ?? false,
          excluded:        excludedSet.has(t.id),
          splits:          t.splits          ?? undefined,
        },
      });
    }

    for (let idx = 0; idx < accounts.length; idx++) {
      const a = accounts[idx];
      await prisma.account.create({
        data: {
          id:         a.id,
          name:       a.name,
          type:       a.type,
          cashFlow:   a.cashFlow   ?? null,
          isBankFeed: a.isBankFeed ?? false,
          parentId:   a.parentId   ?? null,
          inactive:   a.inactive   ?? false,
          sortOrder:  accountOrder
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

    const upsertSetting = async (key, value) => {
      await prisma.setting.upsert({
        where:  { key },
        update: { value: value ?? null },
        create: { key, value: value ?? null },
      });
    };

    await upsertSetting("accountOrder",      accountOrder);
    await upsertSetting("reportNames",       reportNames);
    await upsertSetting("customTheme",       customTheme);
    await upsertSetting("customReportTheme", customReportTheme);
    await upsertSetting("themeName",         themeName);
    await upsertSetting("showCoaInactive",   showCoaInactive);

    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/data error:", e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Ledger server running on port ${PORT}`));
