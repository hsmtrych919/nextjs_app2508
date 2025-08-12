# Cloudflare Pages デプロイメントガイド
## Agent 2 - Phase 1-4: 完全なデプロイ手順

### 📋 事前準備

#### 1. 必要なツールのインストール
```bash
# Wrangler CLI（グローバル）
npm install -g wrangler

# プロジェクト依存関係
npm install
```

#### 2. Cloudflare認証
```bash
# Cloudflareアカウントにログイン
wrangler login

# アカウント情報確認
wrangler whoami
```

### 🗄️ データベース設定

#### 1. D1データベース作成
```bash
# データベース作成（自動スクリプト使用）
./scripts/setup-database.sh

# または手動作成
wrangler d1 create satellite-investment-db
```

#### 2. データベースID設定
1. `wrangler d1 list` でデータベースIDを取得
2. `wrangler.toml` の `database_id` を更新：
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "satellite-investment-db"
   database_id = "YOUR_ACTUAL_DATABASE_ID_HERE"
   ```

#### 3. マイグレーション実行
```bash
# ローカル開発用
./scripts/manage-migrations.sh migrate-local

# 本番用
./scripts/manage-migrations.sh migrate-prod
```

### 🚀 デプロイメント

#### 1. プロジェクトビルド
```bash
# デプロイ用ビルド
npm run build
```

#### 2. Pages プロジェクト作成
```bash
# 初回デプロイ（プロジェクト作成）
wrangler pages deploy _dist --project-name satellite-investment-app

# 継続デプロイ
wrangler pages deploy _dist
```

<!-- #### 3. カスタムドメイン設定（オプション）
```bash
wrangler pages domain add satellite-investment-app your-domain.com
``` -->

### ⚙️ 環境設定

#### 1. 環境変数設定
```bash
# 本番環境変数
wrangler pages secret put ENVIRONMENT --value="production"
wrangler pages secret put API_VERSION --value="1.0.0"

# プレビュー環境変数
wrangler pages secret put ENVIRONMENT --env=preview --value="preview"
```

#### 2. D1データベースバインディング
```bash
# Pages プロジェクトにD1をバインド
wrangler pages deployment list --project-name satellite-investment-app
```

### 🔧 Cron Triggers設定

#### 1. Cron設定確認
```toml
# wrangler.toml で設定済み
[[triggers.crons]]
cron = "0 5 * * *"  # 毎日AM5:00（UTC）
timezone = "Asia/Tokyo"
```

#### 2. Cronデプロイ
```bash
wrangler pages deploy _dist
```

### 🧪 動作確認

#### 1. API エンドポイント テスト
```bash
# データ取得API
curl https://your-app.pages.dev/api/data

# Cron API（手動実行）
curl -X POST https://your-app.pages.dev/api/cron
```

#### 2. データベース接続確認
```bash
# 本番データベースの状態確認
wrangler d1 execute satellite-investment-db --command="SELECT * FROM settings;"
```

#### 3. Cron動作確認
```bash
# Cronトリガーのログ確認
wrangler pages deployment tail --project-name satellite-investment-app
```

### 🔍 トラブルシューティング

#### よくある問題と解決方法

**1. データベース接続エラー**
```bash
# データベースID確認
wrangler d1 list

# バインディング確認
wrangler pages deployment list --project-name satellite-investment-app
```

**2. API 500エラー**
```bash
# ログ確認
wrangler pages deployment tail --project-name satellite-investment-app

# ローカル実行でデバッグ
wrangler pages dev _dist --d1 DB=satellite-investment-db
```

**3. Cron実行されない**
```bash
# Cronトリガー確認
wrangler pages deployment list --project-name satellite-investment-app

# 手動Cron実行
curl -X POST https://your-app.pages.dev/api/cron
```

### 📊 監視とメンテナンス

#### 1. Analytics確認
Cloudflare Dashboard > Analytics > Web Analytics

#### 2. D1使用量確認
Cloudflare Dashboard > D1 > satellite-investment-db > Metrics

#### 3. Functions実行状況
Cloudflare Dashboard > Pages > satellite-investment-app > Functions

### 🔄 継続的デプロイメント

#### GitHub Actions設定（オプション）
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: wrangler pages deploy _dist
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### ✅ デプロイメント完了チェックリスト

- [ ] D1データベース作成・設定
- [ ] マイグレーション実行
- [ ] wrangler.toml設定完了
- [ ] プロジェクトビルド成功
- [ ] Pages デプロイ成功
- [ ] 環境変数設定完了
- [ ] API動作確認
- [ ] Cron動作確認
- [ ] セキュリティヘッダー確認
- [ ] パフォーマンス確認

### 📞 サポート

**ドキュメント:**
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

**Phase 1-4 完了**: Cloudflare環境設定完成