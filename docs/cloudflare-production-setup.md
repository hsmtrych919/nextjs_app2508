# Cloudflare 本番環境セットアップガイド

### セキュリティ設定

#### 本番環境で必要な最低限の設定
- `DEBUG_MODE=false` - デバッグ情報の無効化
- `LOG_LEVEL=warn` - 本番用ログレベル
- `ENVIRONMENT=production` - 環境識別

#### 機密情報の管理
- データベースURLやAPIキーはSecretsとして設定
- 環境変数は公開情報のみ
- ローカル開発時は`.env.local`（gitignore対象）


### 1. Cloudflare D1本番設定

#### 本番用データベース作成コマンド
```bash
# 本番用データベース作成
wrangler d1 create satellite-investment-db-prod

# データベースIDを確認
wrangler d1 list
```

#### 本番環境のwrangler.toml設定更新
```toml
# 本番用D1設定（有効化）
[env.production.d1_databases]
binding = "DB"
database_name = "satellite-investment-db-prod"
database_id = "production-database-id-here"
```

### 2. Workers本番デプロイ設定

#### 本番デプロイスクリプト追加
```json
"deploy:prod": "npm run build && wrangler pages deploy _dist --env=production",
"deploy:staging": "npm run build && wrangler pages deploy _dist --env=preview"
```

#### 本番環境でのCron設定確認
```bash
# Cron triggerが正しく設定されていることを確認
wrangler pages list
wrangler pages functions list
```

### 3. 環境変数管理

#### Cloudflare Dashboard での環境変数設定
- `ENVIRONMENT=production`
- `DEBUG_MODE=false`
- `LOG_LEVEL=warn`

#### Secretsの設定（必要に応じて）
```bash
# API キーなどの機密情報がある場合
wrangler pages secret put API_SECRET
```

### 4. 本番マイグレーション実行手順

```bash
# 1. 本番データベースへマイグレーション実行
npm run db:migrate:prod

# 2. 接続テスト
wrangler d1 execute satellite-investment-db-prod --command="SELECT * FROM settings;"
```

### 5. デプロイメント手順

```bash
# 1. ビルド + 本番デプロイ
npm run deploy:prod

# 2. デプロイ後の動作確認
# - Cron triggerの動作確認
# - データベース接続確認
# - API endpoints動作確認
```