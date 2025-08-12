# Cloudflare ローカル開発環境設定 行動計画書（セキュリティ対応版）
## Phase 3完了後 → ローカル開発テスト準備

### 📋 現在の状況
- ✅ Phase 3まで完了（フロントエンド・バックエンドコード作成済み）
- ✅ Cloudflareアカウント作成済み
- ✅ Wranglerインストール済み
- ❌ Cloudflare D1データベース未作成
- ❌ ローカル開発環境での動作確認未実施

### � セキュリティ重要事項
**Database IDやAccount IDは機密情報です**
- GitHubなどに公開されるファイルに直接書かない
- 環境変数で管理する
- 本計画書では安全な管理方法を説明します

---


---

## 🎯 目標
**`wrangler pages dev` でローカル開発環境を正常に動作させる**

現在のコードはCloudflare D1データベースに依存しているため、ローカルでテストするにはCloudflareの準備が必要です。

**重要**: `npm run dev` ではなく `wrangler pages dev` を使用してテストします（D1データベース接続のため）

---

## 📝 作業手順（初心者向け詳細解説）

### ステップ1: Cloudflare認証確認 【5分】

#### 1.1 Wranglerがインストールされているか確認
```bash
wrangler --version
```
**解説**: バージョンが表示されればOK。エラーが出る場合は `npm install -g wrangler` で再インストール

#### 1.2 Cloudflareアカウントにログイン
```bash
wrangler login
```
**解説**:
- ブラウザが自動で開きます
- Cloudflareアカウントでログインしてください
- 「Wrangler CLIを許可しますか？」で「Allow」をクリック
- ターミナルに戻って成功メッセージを確認

#### 1.3 ログイン状態確認
```bash
wrangler whoami
```
**解説**: あなたのCloudflareアカウント情報が表示されればOK

---

### ステップ2: D1データベース作成 【10分】

#### 2.1 自動スクリプトでデータベース作成
```bash
chmod +x ./scripts/setup-database.sh
./scripts/setup-database.sh
```

**画面の指示に従って操作:**
1. `Create production database? (y/N):` → **y** と入力してEnter
2. `Run migrations on production database? (y/N):` → **N** と入力してEnter（後で手動実行）
3. `Setup local development database? (Y/n):` → **Y** と入力してEnter

**解説**:
- このスクリプトが「satellite-investment-db」という名前のデータベースを作成します
- ローカル開発用のデータベースも同時に準備されます

#### 2.2 データベースUUID（Database ID）取得
```bash
wrangler d1 list
```
**表示例:**
```
┌──────────────────────────────────────┬─────────────────────────┬─────────────────┬─────────┬───────────┬───────────┐
│ uuid                                 │ name                    │ created_at      │ version │ num_tables│ file_size │
├──────────────────────────────────────┼─────────────────────────┼─────────────────┼─────────┼───────────┼───────────┤
│ 01234567-89ab-cdef-1234-567890abcdef │ satellite-investment-db │ 2025-08-12...   │ 1       │ 0         │ 8192      │
└──────────────────────────────────────┴─────────────────────────┴─────────────────┴─────────┴───────────┴───────────┘
```

**重要**: **`uuid`列がDatabase ID**です。これをコピーしてください（例: `01234567-89ab-cdef-1234-567890abcdef`）

#### 2.3 wrangler.tomlの一時的設定（ローカル開発用）
ローカル開発・テスト用に一時的に実際のDatabase IDを設定します：

`wrangler.toml` ファイルの該当部分を編集:
```toml
# D1データベース設定（ローカル開発用）
database_id = "31102c68-1cd7-4696-862f-2a115724f331"
```

**重要**:
Wranglerの環境変数参照構文は本番デプロイ時専用で、ローカル開発時には直接値を指定する必要があります。
仕様を理解したうえで手動でセキュリティ対策

- これは**ローカル開発・テスト専用**の設定です
- 本番デプロイ前には空文字に戻してセキュア化します
- Wranglerは**ローカル実行時に環境変数参照を認識しません**

#### 2.4 .env.localファイル作成（将来の本番デプロイ用）
```bash
# .env.local ファイル作成（本番デプロイ時に使用）
echo "DATABASE_ID=31102c68-1cd7-4696-862f-2a115724f331" > .env.local
echo "# Cloudflare Database ID - 機密情報" >> .env.local
```

**解説**:
- 本番デプロイ時にCloudflare Secretsで管理するための準備
- 現在のローカル開発では使用されません---

### ステップ3: データベース初期化 【5分】

#### 3.1 マイグレーション実行（ローカル）
```bash
chmod +x ./scripts/manage-migrations.sh
./scripts/manage-migrations.sh migrate-local
```

**解説**:
- データベースにテーブル（settings, budget, holdings等）を作成します
- ローカル開発用なので安全です

#### 3.2 データベース状態確認
```bash
./scripts/manage-migrations.sh status-local
```

**期待される表示:**
```
settings
budget
holdings
formation_usage
formation_history
_cf_METADATA
```

**解説**:
- 5つのアプリテーブルが表示されれば成功です
- `_cf_METADATA` はCloudflare D1が自動作成する内部管理テーブル（正常）

---

### ステップ4: ローカル開発環境テスト 【10分】

#### 4.1 プロジェクトビルド
```bash
npm run build
```

**解説**:
- Next.jsアプリケーションをビルドします
- `_dist` フォルダにビルド結果が出力されます

#### 4.2 Cloudflare環境でローカルテスト（メイン方法）
```bash
wrangler pages dev _dist --d1 DB=satellite-investment-db
```

**期待される表示:**
```
Using compatibility date: 2025-08-10
✅ Loaded .env.local
🌍 Serving at http://localhost:8788
```

**解説**:
- **これがメインのローカル開発環境です** npm run dev では d1情報の確認までカバーできないのでビルド＋wrangler のdev コマンド
- D1データベースが正しく接続されます
- `.env.local` の環境変数が自動で読み込まれます
- `http://localhost:8788` でアクセスしてください

#### 4.3 通常のNext.js開発サーバー（参考・D1使用不可）
```bash
npm run dev
```

**注意**:
- `http://localhost:3000` で起動しますが、**D1データベースに接続できません**
- UIの確認のみに使用してください
- データベース機能のテストには`wrangler pages dev`を使用

---

### ステップ5: 動作確認 【10分】

#### 5.1 APIエンドポイントテスト
ブラウザかcurlで以下をテスト:
```bash
# データ取得API
curl http://localhost:8788/api/data

# 期待される結果: JSON形式のデータが返される
```

#### 5.2 画面動作確認
1. ブラウザでアプリにアクセス
2. フォーメーション選択ができるか確認
3. 銘柄入力ができるか確認
4. データが保存されるか確認

#### 5.3 データベース内容確認
```bash
wrangler d1 execute satellite-investment-db --local --command="SELECT * FROM settings;"
```

**解説**: 設定データが正しく保存されているか確認

---

## 🚨 よくあるトラブルと解決方法

### トラブル1: `wrangler login` が失敗する
**症状**: ブラウザが開かない、認証エラー
**解決方法**:
```bash
wrangler logout
wrangler login --browser=false
```
表示されるURLを手動でブラウザで開く

### トラブル2: データベース作成でエラー
**症状**: `Error creating database`
**解決方法**:
1. アカウントが有効か確認: `wrangler whoami`
2. 手動でデータベース作成: `wrangler d1 create satellite-investment-db`

### トラブル3: Database ID認識エラー
**症状**: `Error: Unknown database identifier`
**解決方法**:
1. `.env.local` ファイルが作成されているか確認
2. DATABASE_IDが正しく設定されているか確認: `cat .env.local`
3. `wrangler d1 list` で正しいuuidをコピー
4. `.env.local` を再作成

### トラブル4: `npm run dev` で動作しない
**症状**: データベース接続エラー
**解決方法**: `wrangler pages dev` を使用してローカルテストしてください（D1接続には必須）

---

## 📋 完了チェックリスト

### 準備完了の確認項目
- [ ] `wrangler whoami` でアカウント確認OK
- [ ] `wrangler d1 list` でデータベース表示OK
- [ ] `.env.local` にDATABASE_ID設定完了
- [ ] `./scripts/manage-migrations.sh status-local` でテーブル5つ確認
- [ ] `npm run build` でビルド成功
- [ ] `wrangler pages dev _dist --d1 DB=satellite-investment-db` で起動OK
- [ ] `http://localhost:8788` でアプリ動作確認OK
- [ ] API `curl localhost:8788/api/data` でデータ取得OK

### すべて完了したら
✅ **ローカル開発環境準備完了！**

これで `wrangler pages dev _dist --d1 DB=satellite-investment-db` でのローカル開発が可能になります。

---

## 🔄 次のステップ
ローカル開発環境が整ったら、以下を検討してください:

1. **機能テスト**: すべての機能が正常に動作するか確認
2. **本番デプロイ**: `docs/cloudflare-deployment-guide.md` を参考に本番環境デプロイ
3. **継続開発**: 新機能追加や改善

---

## 💡 重要ポイント
- **ローカル開発**: `wrangler pages dev _dist --d1 DB=satellite-investment-db` を使用（D1データベース接続のため）
- **セキュリティ**: Database IDは `.env.local` で管理（GitHubに公開されない）
- **データベース**: ローカル用と本番用は別々に管理
- **トラブル時**: `wrangler d1 execute ... --local` でローカルデータベース確認
- **本番反映**: ローカルで確認後、本番デプロイを実行

## 🔄 セキュアな本番デプロイのための次ステップ

ローカル開発環境が整った後、本番デプロイ時はセキュアな設定が必要です：

### 1. wrangler.toml のセキュア化
```toml
# セキュア版（GitHubに公開してもOK）
[[d1_databases]]
binding = "DB"
database_name = "satellite-investment-db"
database_id = ""  # 空文字にしてCloudflareのSecretsで管理
```

### 2. Cloudflare Secretsでの管理
```bash
# 本番デプロイ時に実行
wrangler secret put DATABASE_ID
# プロンプトで実際のuuidを入力
```

**初心者の方へ**: わからないことがあれば、各コマンドを一つずつ実行して結果を確認してください。エラーが出た場合は、エラーメッセージを読んで上記のトラブルシューティングを参考にしてください。


# 完了

ローカル開発環境 完全セットアップ完了
あなたの結果を確認すると：

🔍 確認できた完了状況
D1データベース接続成功 ✅

wrangler d1 execute コマンドが正常に動作
データベースにアクセスできている
テーブル作成完了 ✅

settings テーブルが正しく作成されている
デフォルトデータが正常に挿入されている
データ構造確認 ✅

API動作確認済み ✅

前回のテストで /api/data が正常にJSONレスポンスを返した
📋 最終チェックリスト（すべて完了）
<input checked="" disabled="" type="checkbox"> wrangler whoami でアカウント確認OK
<input checked="" disabled="" type="checkbox"> wrangler d1 list でデータベース表示OK
<input checked="" disabled="" type="checkbox"> .env.local にDATABASE_ID設定完了
<input checked="" disabled="" type="checkbox"> .[manage-migrations.sh](http://_vscodecontentref_/2) status-local でテーブル5つ確認
<input checked="" disabled="" type="checkbox"> npm run build でビルド成功
<input checked="" disabled="" type="checkbox"> wrangler pages dev _dist --d1 DB=satellite-investment-db で起動OK
<input checked="" disabled="" type="checkbox"> http://localhost:8788 でアプリ動作確認OK
<input checked="" disabled="" type="checkbox"> API curl localhost:8788/api/data でデータ取得OK
<input checked="" disabled="" type="checkbox"> データベース内容確認OK ← 今回の確認
🎯 結論：ローカル開発環境は完全に準備完了です！
これで以下が可能になりました：

完全なローカル開発: wrangler pages dev _dist --d1 DB=satellite-investment-db
D1データベース接続: 本番と同等の環境でのテスト
API機能テスト: データの保存・読み込み・更新
アプリケーション全機能: フォーメーション選択、銘柄管理、設定保存
🚀 次のステップの選択肢
継続開発: 新機能の追加や改善
本番デプロイ: cloudflare-deployment-guide.md を参考に本番環境構築
機能テスト: より詳細な動作確認やデータ操作テスト
