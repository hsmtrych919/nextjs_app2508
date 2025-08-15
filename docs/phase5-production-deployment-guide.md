# Phase 5.1 Cloudflare本番環境設定 実行ガイド

## 🚨 重要: あなたが実行すべき作業

以下の作業は**Cloudflareアカウントの管理者権限**が必要なため、私（AI）では実行できません。
**あなたご自身で実行していただく必要があります。**

---

## 📋 事前確認

### ✅ 完了済み項目（ローカル開発環境）
- ローカルD1データベース: `satellite-investment-db` 作成済み
- ローカル開発サーバー: `wrangler pages dev` 正常動作
- 全機能テスト: フォーメーション選択・銘柄入力・計算機能 完全動作確認済み
- iPhone 12 Proエミュレーション: 完全対応済み

### ❌ 未実施項目（本番環境）
- 本番D1データベース作成
- 本番Pages環境設定
- 本番環境変数・Secrets設定
- 本番デプロイ

---

## 🎯 Step 1: Cloudflare認証再設定【5分】

### 1.1 Wrangler再ログイン
```bash
# 現在の認証をクリア
wrangler logout

# 再ログイン（ブラウザが開きます）
wrangler login
```

**手順:**
1. ブラウザでCloudflareにログイン
2. 「Wrangler CLIを許可しますか？」→ **Allow**をクリック
3. ターミナルで成功メッセージ確認

### 1.2 認証確認
```bash
# アカウント情報確認
wrangler whoami

# データベース一覧確認
wrangler d1 list
```

**期待結果:**
- アカウント情報が正常表示
- 現在のローカル開発用データベース `satellite-investment-db` が表示

---

## 🎯 Step 2: 本番D1データベース作成【10分】

### 2.1 本番用データベース作成
```bash
# 本番用データベース作成
wrangler d1 create satellite-investment-db-prod
```

**重要:** 作成後に表示される**Database ID**をコピーしてください。
```
✅ Successfully created D1 database!

📋 Database Details
Name: satellite-investment-db-prod
UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ← これをコピー
```

### 2.2 本番データベースID確認
```bash
# 作成されたデータベース一覧でUUID確認
wrangler d1 list
```

**重要:** `satellite-investment-db-prod` のUUIDをStep 4.3で使用します。

### 2.3 本番データベースにマイグレーション実行
```bash
# 本番データベースにテーブル作成
wrangler d1 execute satellite-investment-db-prod --file=./db/migrations/0001_initial.sql --env=production
```

### 2.4 本番データベース状態確認
```bash
# テーブル作成確認
wrangler d1 execute satellite-investment-db-prod --command="SELECT name FROM sqlite_master WHERE type='table';" --env=production
```

**期待結果:**
```
settings
budget
holdings
formation_usage
formation_history
```

---

## 🎯 Step 3: Cloudflare Pages本番環境作成【15分】

### 3.1 Pages プロジェクト作成
```bash
# Pagesプロジェクト作成・初回デプロイ
npm run build
wrangler pages deploy _dist --project-name=satellite-investment-app
```

**手順:**
1. プロジェクト名: `satellite-investment-app`
2. 初回デプロイが実行されます
3. 完了後にURL（例: `https://xxxxxxxx.satellite-investment-app.pages.dev`）が表示

### 3.2 デプロイ完了確認
デプロイ完了後、以下のような本番URLが表示されます:
```
✅ Deployment complete!
URL: https://xxxxxxxx.satellite-investment-app.pages.dev
```

このURLはStep 6.2の動作確認で使用します。

---

## 🎯 Step 4: 本番環境変数・Secrets設定【10分】

### 4.1 Cloudflare Dashboard設定

**Cloudflare Dashboard（https://dash.cloudflare.com）にアクセス:**

1. **Workers & Pages** → **satellite-investment-app** を選択
2. **Settings** → **Environment variables** → **Production** タブ

### 4.2 環境変数設定（Production）
以下を追加:
```
ENVIRONMENT = production
DEBUG_MODE = false
LOG_LEVEL = warn
API_VERSION = 1.0.0
APP_NAME = Satellite Investment Manager
TYPE_SYSTEM_VERSION = 1.3.0
```

### 4.3 Secrets設定（機密情報）
**Settings** → **Secrets and Variables** → **Production**で以下を設定:

```bash
# まずDatabase UUIDを確認
wrangler d1 list

# 表示された satellite-investment-db-prod のUUIDを
# Cloudflare DashboardのSecretsに設定:
# Variable name: PROD_DATABASE_ID
# Value: [上記コマンドで確認したUUID]
```

### 4.4 Functions binding設定
**Settings** → **Functions** → **D1 database bindings**:
```
Variable name: DB
D1 database: satellite-investment-db-prod
```

---

## 🎯 Step 5: Cron Triggers設定【5分】

### 5.1 Cron設定確認
```bash
# Cron設定状況確認
wrangler pages list
```

### 5.2 必要に応じてCron手動設定
Cloudflare Dashboardで確認:
- **Workers & Pages** → **satellite-investment-app** → **Scheduled Events**
- 設定: `0 5 * * *` (毎日午前5時JST)

---

## 🎯 Step 6: 本番デプロイ・動作確認【15分】

### 6.1 最新コードデプロイ
```bash
# 最新ビルド・デプロイ
npm run build
wrangler pages deploy _dist --project-name=satellite-investment-app --env=production
```

### 6.2 本番環境動作確認

**Step 3.2で記録した本番URLにアクセスして確認:**

#### 6.2.1 基本機能確認
- [ ] アプリケーション読み込み正常
- [ ] フォーメーション選択動作
- [ ] Tier別銘柄入力表示
- [ ] 投資予算管理機能

#### 6.2.2 データベース接続確認
- [ ] フォーメーション選択→データ保存
- [ ] 銘柄入力→データ保存
- [ ] ページリロード→データ復元

#### 6.2.3 計算機能確認
- [ ] Goal株数自動計算
- [ ] Hold/Goal表示
- [ ] 利回り自動計算

### 6.3 本番API動作確認
```bash
# 本番APIテスト（URLを実際のものに変更）
curl https://[あなたの本番URL]/api/data
```

**期待結果:** JSON形式でデータが返される

---

## 🎯 Step 7: セキュリティ・最終設定【10分】

### 7.1 wrangler.toml のセキュア化
**重要:** 現在の`wrangler.toml`にあるローカル開発用のDatabase IDを削除

```toml
# 以下の行を編集:
database_id = "31102c68-1cd7-4696-862f-2a115724f331"  # ← これを削除
↓
database_id = ""  # 空文字にしてセキュア化
```

### 7.2 Custom Domain設定（オプション）
独自ドメインを使用する場合:
- Cloudflare Dashboard → **Custom domains**で設定

### 7.3 セキュリティヘッダー確認
本番URLで以下を確認:
- HTTPS接続
- セキュリティヘッダー適用状況

---

## ✅ 完了チェックリスト

### Phase 5.1 本番環境設定
- [ ] Wrangler認証成功（`wrangler whoami`）
- [ ] 本番D1データベース作成・マイグレーション完了
- [ ] Cloudflare Pages プロジェクト作成・初回デプロイ完了
- [ ] 本番環境変数・Secrets設定完了
- [ ] D1 binding設定完了
- [ ] Cron Triggers設定確認
- [ ] 本番デプロイ・全機能動作確認完了
- [ ] wrangler.toml セキュア化完了

### 機能動作確認
- [ ] フォーメーション選択システム
- [ ] Tier別銘柄入力・Goal計算
- [ ] 投資予算管理・利回り計算
- [ ] データ保存・自動保存機能
- [ ] iPhone 12 Pro表示対応

---

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 問題1: `wrangler login`失敗
```bash
wrangler logout
wrangler login --browser=false
# 表示されるURLを手動でブラウザで開く
```

#### 問題2: Database binding認識しない
- Cloudflare Dashboard → Functions → D1 database bindings を再確認
- Variable name: `DB`
- Database: `satellite-investment-db-prod`

#### 問題3: 本番デプロイでエラー
```bash
# 詳細ログ確認
wrangler pages deploy _dist --project-name=satellite-investment-app --compatibility-date=2025-08-10
```

#### 問題4: データが保存されない
- Secrets設定確認: `PROD_DATABASE_ID`
- D1 binding確認
- ブラウザ開発者ツールでAPI エラー確認

---

## 📞 サポート

作業中に問題が発生した場合:
1. エラーメッセージを正確にコピー
2. 実行したコマンドを記録
3. Cloudflare Dashboardの設定画面のスクリーンショット
4. 私（AI）に詳細をお伝えください

---

**⚠️ 重要事項:**
- この作業は**本番環境**に影響します
- 各ステップを慎重に実行してください
- エラーが発生した場合は中断して相談してください
- 全ての設定情報は機密として管理してください

**🎯 目標:** 本番環境でサテライト投資管理アプリが完全動作すること
