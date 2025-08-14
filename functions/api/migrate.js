// Pages環境でのマイグレーション実行用API
export async function onRequestPost(context) {
  const { env } = context;

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'D1 binding not found'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // マイグレーションSQL（順序修正版）
    const createTableStatements = [
      `CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        current_formation_id TEXT NOT NULL,
        last_check_date TEXT NOT NULL,
        auto_check_enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS budget (
        id TEXT PRIMARY KEY,
        funds REAL NOT NULL,
        start REAL NOT NULL,
        profit REAL NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS holdings (
        id TEXT PRIMARY KEY,
        ticker TEXT NOT NULL,
        tier INTEGER NOT NULL,
        percentage REAL NOT NULL,
        target_amount REAL NOT NULL,
        entry_price REAL,
        hold_quantity REAL DEFAULT 0,
        goal_quantity REAL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS formation_usage (
        formation_id TEXT PRIMARY KEY,
        usage_count INTEGER NOT NULL DEFAULT 0,
        last_used TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      `CREATE TABLE IF NOT EXISTS formation_history (
        id TEXT PRIMARY KEY,
        formation_id TEXT NOT NULL,
        changed_at TEXT NOT NULL DEFAULT (datetime('now')),
        reason TEXT
      )`
    ];

    const indexStatements = [
      `CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at)`,
      `CREATE INDEX IF NOT EXISTS idx_budget_updated_at ON budget(updated_at)`,
      `CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON holdings(ticker)`,
      `CREATE INDEX IF NOT EXISTS idx_holdings_tier ON holdings(tier)`,
      `CREATE INDEX IF NOT EXISTS idx_holdings_updated_at ON holdings(updated_at)`,
      `CREATE INDEX IF NOT EXISTS idx_formation_usage_updated_at ON formation_usage(updated_at)`,
      `CREATE INDEX IF NOT EXISTS idx_formation_history_changed_at ON formation_history(changed_at)`
    ];

    const dataStatements = [
      `INSERT OR REPLACE INTO settings (id, current_formation_id, last_check_date, auto_check_enabled)
       VALUES ('default-settings', 'formation-3-50-30-20', datetime('now'), true)`,

      `INSERT OR REPLACE INTO budget (id, funds, start, profit)
       VALUES ('default-budget', 6000, 6000, 0)`
    ];

    const results = [];

    // テーブル作成
    for (const statement of createTableStatements) {
      try {
        await env.DB.prepare(statement).run();
        results.push({ type: 'table', success: true });
      } catch (error) {
        results.push({ type: 'table', error: error.message });
      }
    }

    // インデックス作成
    for (const statement of indexStatements) {
      try {
        await env.DB.prepare(statement).run();
        results.push({ type: 'index', success: true });
      } catch (error) {
        results.push({ type: 'index', error: error.message });
      }
    }

    // 初期データ投入
    for (const statement of dataStatements) {
      try {
        await env.DB.prepare(statement).run();
        results.push({ type: 'data', success: true });
      } catch (error) {
        results.push({ type: 'data', error: error.message });
      }
    }

    // テーブル確認
    const tables = await env.DB.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();

    return new Response(JSON.stringify({
      success: true,
      message: 'Migration completed',
      results,
      tables: tables.results.map(r => r.name)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
