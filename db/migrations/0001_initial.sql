-- サテライト投資管理アプリ - 初期マイグレーション
-- Generated on: 2025-08-10
-- Drizzle ORM Migration

-- 設定テーブル（アプリ全体の設定管理）
CREATE TABLE `settings` (
  `id` text PRIMARY KEY NOT NULL,
  `current_formation_id` text NOT NULL,
  `last_check_date` text NOT NULL,
  `auto_check_enabled` integer DEFAULT true NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

-- 予算管理テーブル
CREATE TABLE `budget` (
  `id` text PRIMARY KEY NOT NULL,
  `funds` real NOT NULL,
  `start` real NOT NULL,
  `profit` real NOT NULL,
  `updated_at` text NOT NULL
);

-- 銘柄保有情報テーブル
CREATE TABLE `holdings` (
  `id` text PRIMARY KEY NOT NULL,
  `ticker` text NOT NULL,
  `tier` integer NOT NULL,
  `entry_price` real NOT NULL,
  `hold_shares` integer NOT NULL,
  `goal_shares` integer NOT NULL,
  `updated_at` text NOT NULL
);

-- フォーメーション使用統計テーブル
CREATE TABLE `formation_usage` (
  `id` text PRIMARY KEY NOT NULL,
  `formation_id` text NOT NULL,
  `usage_count` integer DEFAULT 0 NOT NULL,
  `total_days` integer DEFAULT 0 NOT NULL,
  `usage_percentage` real DEFAULT 0 NOT NULL,
  `last_used_date` text NOT NULL,
  `created_at` text NOT NULL
);

-- フォーメーション変更履歴テーブル（オプション）
CREATE TABLE `formation_history` (
  `id` text PRIMARY KEY NOT NULL,
  `from_formation_id` text,
  `to_formation_id` text NOT NULL,
  `changed_at` text NOT NULL,
  `reason` text
);

-- インデックス作成
CREATE INDEX `holdings_ticker_idx` ON `holdings` (`ticker`);
CREATE INDEX `formation_usage_formation_id_idx` ON `formation_usage` (`formation_id`);
CREATE INDEX `formation_history_to_formation_idx` ON `formation_history` (`to_formation_id`);

-- 初期データ挿入
INSERT INTO `settings` (`id`, `current_formation_id`, `last_check_date`, `auto_check_enabled`, `created_at`, `updated_at`) 
VALUES ('default-settings', 'formation-3-50-30-20', datetime('now'), true, datetime('now'), datetime('now'));

INSERT INTO `budget` (`id`, `funds`, `start`, `profit`, `updated_at`) 
VALUES ('default-budget', 6000.0, 6000.0, 0.0, datetime('now'));

-- 初期フォーメーション使用統計
INSERT INTO `formation_usage` (`id`, `formation_id`, `usage_count`, `total_days`, `usage_percentage`, `last_used_date`, `created_at`) 
VALUES 
  ('usage-formation-3-50-30-20', 'formation-3-50-30-20', 1, 1, 100.0, datetime('now'), datetime('now')),
  ('usage-formation-4-40-30-20-10', 'formation-4-40-30-20-10', 0, 1, 0.0, datetime('now'), datetime('now')),
  ('usage-formation-5-30-25-20-15-10', 'formation-5-30-25-20-15-10', 0, 1, 0.0, datetime('now'), datetime('now'));