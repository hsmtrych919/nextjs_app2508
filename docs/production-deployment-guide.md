# Cloudflare Pages 本番環境設定 完全ガイド

## 🎯 実行済み修正：実際の問題解決過程に基づく

このガイドは実際の本番環境デプロイで発生した問題と解決方法を反映しています。

---

## 📋 事前状況確認

### ✅ 完了済み項目（検証済み）
- Next.js 13.5.11アプリケーション正常動作
- wrangler CLI 4.28.1インストール・認証済み
- ローカル開発環境完全動作
- 自動保存システム動作確認済み

### ⚠️ 実際に発生した問題
- **D1データベースマイグレーション未実行**（最重要問題）
- **wrangler.tomlのpreview環境設定不足**
- **Production vs Preview環境の区別不明確**
- **SSL証明書検証エラーでAPI確認困難**

---

## 🎯 Step 1: D1データベース設定【最重要・15分】

### 1.1 既存データベース確認
```bash
# 認証状況確認
wrangler whoami

# 既存データベース一覧
wrangler d1 list
```

**期待結果:**
```
satellite-investment-db-prod (a30360f1-cac4-4f36-b3e6-6b3fb52ff1ee)
```

### 1.2 **🚨 重要：D1マイグレーション実行**
**問題：** D1データベースは作成済みでもテーブルが未作成の状態

```bash
# テーブル状態確認（修正前：num_tables: 0）
wrangler d1 info satellite-investment-db-prod

# 【必須】マイグレーション実行
wrangler d1 execute satellite-investment-db-prod --file=./db/migrations/0001_initial.sql --remote
```

**期待結果:**
```
🌀 Mapping SQL input into an array of statements
🌀 Parsing 11 statements
🌀 Executing on satellite-investment-db-prod (a30360f1-cac4-4f36-b3e6-6b3fb52ff1ee):
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
✅ Successfully executed 11 commands.
📊 Executed 11 commands in 0.07 seconds (13 rows read, 31 rows written)
```

### 1.3 テーブル作成確認
```bash
# テーブル一覧確認
wrangler d1 execute satellite-investment-db-prod --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

**期待結果：5テーブル作成**
```
settings
budget
holdings
formation_usage
formation_history
```

---

## 🎯 Step 2: wrangler.toml設定修正【10分】

### 2.1 **重要修正：Preview環境設定追加**

**修正内容：**

```toml
# wrangler.toml に以下を追加

[[env.preview.d1_databases]]
binding = "DB"
database_name = "satellite-investment-db-prod"
database_id = "a30360f1-cac4-4f36-b3e6-6b3fb52ff1ee"
```

**重要：** この設定により、preview環境でもD1データベースにアクセス可能になります。

### 2.2 設定確認
```bash
# wrangler.tomlの設定確認
cat wrangler.toml | grep -A 5 "env.preview"
```

---

## 🎯 Step 3: 実際のデプロイ・動作確認【20分】

### 3.1 **重要：Production vs Preview環境の理解**

**Cloudflare Pagesの環境区分：**
- **Production環境**: GitHubリポジトリ連携 + 本番ブランチ（通常main）への自動デプロイ
- **Preview環境**: 手動デプロイまたは他ブランチへのデプロイ

**現在の状況：**
- 手動デプロイ（`wrangler pages deploy`）は**Preview環境**として扱われる
- `--branch=main`指定でもGit連携なしなら**Preview環境**
- これは正常な動作です

### 3.2 アプリケーションビルド
```bash
# 最新ビルド
npm run build
```

### 3.3 Preview環境デプロイ
```bash
# Preview環境にデプロイ
wrangler pages deploy _dist --project-name=satellite-investment-app
```

**期待結果：**
```
✅ Deployment complete! Take a peek over at https://xxxxxxxx.satellite-investment-app.pages.dev
```

### 3.4 **重要：API動作確認**

**SSL証明書エラーの回避：**
```bash
# -k オプションでSSL証明書検証を回避
curl -k -s https://[デプロイURL]/api/data | jq .
```

**期待結果：正常なJSONレスポンス**
```json
{
  "success": true,
  "data": {
    "budget": {...},
    "holdings": [...],
    "settings": {...},
    "formations": [...],
    "usageStats": [...]
  }
}
```

### 3.5 自動保存機能テスト
```bash
# POST APIで自動保存テスト
curl -k -X POST -H "Content-Type: application/json" \
  -d '{"type":"budget","data":{"funds":10000,"start":8000,"profit":2000}}' \
  https://[デプロイURL]/api/data | jq .
```

---

## 🎯 Step 4: 【オプション】真のProduction環境設定【30分】

### 4.1 前提条件
真のProduction環境が必要な場合（独自ドメイン、本格運用等）のみ実行

### 4.2 GitHubリポジトリ準備
```bash
# 現在のコードをGitHubにプッシュ
git add .
git commit -m "Production ready deployment"
git push origin main
```

### 4.3 Cloudflare Pages × GitHub連携設定

**Cloudflare Dashboard（https://dash.cloudflare.com）手順：**

1. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**

2. **GitHub認証・リポジトリ選択**
   - GitHub アカウント認証
   - リポジトリ選択: `hsmtrych919/nextjs_app2508`
   - ブランチ選択: `main` (Production)

3. **ビルド設定**
   ```
   Project name: satellite-investment-app-production
   Production branch: main
   Build command: npm run build
   Build output directory: _dist
   Root directory: /
   ```

4. **環境変数設定（Production）**
   ```
   ENVIRONMENT = production
   DEBUG_MODE = false
   LOG_LEVEL = warn
   API_VERSION = 1.0.0
   APP_NAME = Satellite Investment Manager
   TYPE_SYSTEM_VERSION = 1.3.0
   ```

5. **D1 Database Binding設定**
   - **Settings** → **Functions** → **D1 database bindings**
   ```
   Variable name: DB
   D1 database: satellite-investment-db-prod
   ```

### 4.4 独自ドメイン設定（オプション）
1. **Custom domains** → **Set up a custom domain**
2. ドメイン入力・DNS設定
3. SSL証明書自動発行確認

### 4.5 自動デプロイ確認
- `main`ブランチへのpushで自動デプロイ実行
- Production URLでアクセス確認

---

## 🎯 Step 5: 動作確認・検証【15分】

### 5.1 フルシステムテスト

**ブラウザでの動作確認：**
- [ ] アプリケーション正常ロード
- [ ] フォーメーション選択動作
- [ ] 銘柄入力・Goal計算
- [ ] 投資予算管理機能
- [ ] データ自動保存確認

### 5.2 データ永続化テスト
1. フォーメーション選択
2. 銘柄データ入力
3. ページリロード
4. データ復元確認

### 5.3 iPhone 12 Pro対応確認
- ブラウザ開発者ツールでモバイル表示確認

---

## ✅ 完了チェックリスト

### 基本デプロイ（Preview環境）- 推奨
- [ ] D1データベースマイグレーション実行完了
- [ ] wrangler.toml preview環境設定追加完了
- [ ] Preview環境デプロイ成功
- [ ] API動作確認（curl -k でSSL回避）
- [ ] 自動保存システム動作確認
- [ ] 全機能動作テスト完了

### 本格Production環境（オプション）
- [ ] GitHubリポジトリ連携設定
- [ ] Cloudflare Pages Production環境設定
- [ ] 独自ドメイン設定（必要に応じて）
- [ ] 自動デプロイ動作確認

---

## 🚨 重要な修正点

### 1. **D1マイグレーションが最重要**
- **問題：** データベース作成済みでもテーブル未作成
- **解決：** `wrangler d1 execute --file=./db/migrations/0001_initial.sql --remote`

### 2. **wrangler.toml設定不足**
- **問題：** preview環境用D1設定なし
- **解決：** `[[env.preview.d1_databases]]` セクション追加

### 3. **SSL証明書エラー対策**
- **問題：** curl でAPI確認時にSSL証明書エラー
- **解決：** `curl -k` オプションでSSL検証回避

### 4. **Preview vs Production環境の明確化**
- **重要：** 手動デプロイは全てPreview環境
- **Production：** GitHubリポジトリ連携が必須

---

## 🚨 トラブルシューティング

### よくある問題と実際の解決方法

#### 問題1: API が 500 INTERNAL_ERROR
**原因：** D1データベースのテーブル未作成
```bash
# 解決方法
wrangler d1 execute satellite-investment-db-prod --file=./db/migrations/0001_initial.sql --remote
```

#### 問題2: SSL certificate problem
**原因：** Cloudflare Pages の証明書検証エラー
```bash
# 解決方法
curl -k -s https://[URL]/api/data | jq .
```

#### 問題3: D1 binding not found
**原因：** wrangler.toml の preview環境設定不足
```toml
# 解決方法：wrangler.toml に追加
[[env.preview.d1_databases]]
binding = "DB"
database_name = "satellite-investment-db-prod"
database_id = "a30360f1-cac4-4f36-b3e6-6b3fb52ff1ee"
```

#### 問題4: --branch=main でもPreview環境
**原因：** Git連携なしの手動デプロイは全てPreview
**解決：** 正常な動作、またはStep 4でGitHub連携設定

---

## 📞 サポート・成功例

### 実際の解決成功例
**デプロイURL例：** https://4f642d58.satellite-investment-app.pages.dev
**API応答例：**
```json
{
  "success": true,
  "timestamp": "2025-08-20T12:12:50.710Z",
  "data": {
    "budget": {"id": "default-budget", "funds": 6000, "start": 6000, "profit": 0},
    "holdings": [],
    "settings": {"currentFormationId": "formation-3-50-30-20", "autoCheckEnabled": true},
    "formations": [...],
    "usageStats": [...]
  }
}
```

### サポート依頼時の情報
問題が発生した場合は以下を提供してください：
1. エラーメッセージの正確なコピー
2. 実行したコマンドの履歴
3. `wrangler d1 info satellite-investment-db-prod` の結果
4. `curl -k` でのAPI応答結果

---

**🎯 最終目標達成：**
Preview環境でサテライト投資管理アプリが完全動作すること

**📈 成功指標：**
- API正常応答（200 OK, JSON形式）
- 自動保存システム動作
- 全フォーメーション・銘柄入力機能動作
- データベース読み書き正常
