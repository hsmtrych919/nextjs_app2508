// サテライト投資管理アプリ - Drizzle ORM スキーマ定義
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 設定テーブル（アプリ全体の設定管理）
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  currentFormationId: text('current_formation_id').notNull(),
  lastCheckDate: text('last_check_date').notNull(), // ISO 8601 format
  autoCheckEnabled: integer('auto_check_enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 銘柄保有情報テーブル
export const holdings = sqliteTable('holdings', {
  id: text('id').primaryKey(),
  ticker: text('ticker').notNull(), // AMZN, GOOGL, etc.
  tier: integer('tier').notNull(), // 1, 2, 3, 4, 5 (Tierレベル)
  entryPrice: real('entry_price').notNull(), // エントリー価格（USD）
  holdShares: integer('hold_shares').notNull(), // 保有株数
  goalShares: integer('goal_shares').notNull(), // 目標株数
  updatedAt: text('updated_at').notNull(),
});

// 予算管理テーブル
export const budget = sqliteTable('budget', {
  id: text('id').primaryKey(),
  funds: real('funds').notNull(), // 現在の資金
  start: real('start').notNull(), // スタート時の金額
  profit: real('profit').notNull(), // 利益
  updatedAt: text('updated_at').notNull(),
});

// フォーメーション使用統計テーブル
export const formationUsage = sqliteTable('formation_usage', {
  id: text('id').primaryKey(),
  formationId: text('formation_id').notNull(), // formation-3-50-30-20, etc.
  usageCount: integer('usage_count').notNull().default(0), // 使用日数カウント
  totalDays: integer('total_days').notNull().default(0), // 全体の日数
  usagePercentage: real('usage_percentage').notNull().default(0), // 使用率
  lastUsedDate: text('last_used_date').notNull(),
  createdAt: text('created_at').notNull(),
});

// フォーメーション変更履歴テーブル（オプション）
export const formationHistory = sqliteTable('formation_history', {
  id: text('id').primaryKey(),
  fromFormationId: text('from_formation_id'), // null for initial
  toFormationId: text('to_formation_id').notNull(),
  changedAt: text('changed_at').notNull(),
  reason: text('reason'), // オプション：変更理由
});

// 型エクスポート（Drizzle自動生成）
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

export type Holdings = typeof holdings.$inferSelect;
export type NewHoldings = typeof holdings.$inferInsert;

export type Budget = typeof budget.$inferSelect;
export type NewBudget = typeof budget.$inferInsert;

export type FormationUsage = typeof formationUsage.$inferSelect;
export type NewFormationUsage = typeof formationUsage.$inferInsert;

export type FormationHistory = typeof formationHistory.$inferSelect;
export type NewFormationHistory = typeof formationHistory.$inferInsert;

// インデックス定義
export const holdingsTickerIndex = 'holdings_ticker_idx';
export const formationUsageFormationIdIndex = 'formation_usage_formation_id_idx';
export const formationHistoryToFormationIndex = 'formation_history_to_formation_idx';