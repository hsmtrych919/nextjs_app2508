# Cron機能実装計画書：GitHub Actions方式

## 🎯 概要
Cloudflare PagesにはCron機能がないため、GitHub Actionsを使用して毎日AM5:00（日本時間）にフォーメーション変更の自動チェックを実行する。

---

## 📋 実装方針：Plan A - GitHub Actions Cron

### なぜGitHub Actions？
- **Cloudflare Pages制限**: Cron Triggers非対応
- **GitHub Actions**: 無料、確実、設定簡単
- **外部依存**: GitHubに依存するが、プロジェクトが既にGitHub管理下

---

## 🔧 実装手順

### Step 1: GitHub Actions ワークフローファイル作成

**ファイル**: `.github/workflows/cron-trigger.yml`

```yaml
# GitHub Actions Cron - サテライト投資管理アプリ自動チェック
# 毎日日本時間AM5:00にフォーメーション変更をチェック

name: Daily Formation Check

on:
  schedule:
    # UTC 20:00 = JST 05:00（夏時間考慮）
    - cron: '0 20 * * *'
  # 手動実行も可能
  workflow_dispatch:

jobs:
  cron-trigger:
    runs-on: ubuntu-latest

    steps:
      - name: Call Cron API
        run: |
          curl -X POST \
            -H "User-Agent: GitHub-Actions-Cron" \
            -H "Content-Type: application/json" \
            --fail \
            --retry 3 \
            --retry-delay 10 \
            https://satellite-investment-app.pages.dev/api/cron

      - name: Log Success
        if: success()
        run: echo "✅ Cron job completed successfully at $(date)"

      - name: Log Failure
        if: failure()
        run: echo "❌ Cron job failed at $(date)"
```

### Step 2: 本番URL更新
**重要**: `https://satellite-investment-app.pages.dev` を実際の本番URLに変更

### Step 3: GitHubリポジトリ設定確認
1. GitHub → Settings → Actions → General
2. 「Allow all actions and reusable workflows」が有効であることを確認

---

## ⏰ 実行タイミング詳細

### Cron設定: `'0 20 * * *'`
- **UTC 20:00** = **JST 05:00**
- **毎日実行**
- **夏時間自動対応**（UTCベース）

### 手動実行オプション
- `workflow_dispatch:` により、GitHub Actionsページから手動実行可能
- テスト・デバッグ時に有用

---

## 🔄 動作フロー

```mermaid
graph LR
    A[GitHub Actions] --> B[curl POST]
    B --> C[/api/cron]
    C --> D[フォーメーション変更チェック]
    D --> E{変更あり？}
    E -->|Yes| F[使用率統計更新]
    E -->|No| G[ログ出力のみ]
    F --> H[完了]
    G --> H
```

### 詳細処理
1. **GitHub Actions実行**: 毎日UTC 20:00
2. **API呼び出し**: `POST /api/cron`
3. **フォーメーション変更検知**: 前回チェック以降の変更を確認
4. **統計更新**: 変更があれば使用率カウント+1
5. **結果ログ**: 成功/失敗をGitHub Actionsログに記録

---

## 🛠️ 既存API活用

### `/api/cron.ts` 機能
- ✅ **実装済み**: フォーメーション変更検知ロジック
- ✅ **Pages対応**: `onRequestPost()` 関数実装済み
- ✅ **エラーハンドリング**: 統一されたエラー処理
- ✅ **開発環境対応**: MockCronService実装済み

### API レスポンス例
```json
{
  "success": true,
  "timestamp": "2025-08-16T05:00:00.000Z",
  "data": {
    "message": "フォーメーション使用統計を更新しました: formation-3-50-30-20",
    "changesDetected": true,
    "processedFormations": ["formation-3-50-30-20"],
    "updatedUsage": [...]
  }
}
```

---

## 🔍 監視・デバッグ

### GitHub Actions ログ確認
1. GitHub → Actions → "Daily Formation Check"
2. 各実行の詳細ログを確認
3. 失敗時のエラー内容を確認

### 手動テスト方法
```bash
# ローカルテスト（開発環境）
curl -X POST http://localhost:3000/api/cron

# 本番テスト
curl -X POST https://satellite-investment-app.pages.dev/api/cron
```

### エラー処理
- **3回リトライ**: `--retry 3 --retry-delay 10`
- **失敗時ログ**: GitHub Actionsに記録
- **API側エラー**: 統一エラーハンドリングでレスポンス

---

## 📊 運用・保守

### 日常運用
- **完全自動**: 設定後は自動実行
- **監視不要**: 失敗時のみGitHubからメール通知
- **コスト**: GitHub Actions無料枠内（月2000分）

### メンテナンス
- **URL変更**: ワークフローファイルのURL更新のみ
- **時刻変更**: cron設定の変更のみ
- **停止**: ワークフローファイル削除またはdisable

### トラブルシューティング
1. **API応答確認**: 手動でcurl実行
2. **GitHub Actions設定**: リポジトリ設定確認
3. **時刻確認**: UTC/JST変換の確認

---

## ✅ 実装チェックリスト

### 必要な作業
- [ ] `.github/workflows/cron-trigger.yml` 作成
- [ ] 本番URL確定後、ワークフローファイル更新
- [ ] GitHub Actions有効化確認
- [ ] 初回手動実行でテスト
- [ ] 24時間後の自動実行確認

### 完了済み項目
- [x] `/api/cron.ts` 実装完了
- [x] Pages Functions対応完了
- [x] エラーハンドリング実装完了
- [x] 開発環境テスト対応完了

---

## 🚨 制限事項・注意点

### GitHub Actions制限
- **実行遅延**: 最大15分の遅延可能性
- **依存関係**: GitHubサービス稼働状況に依存
- **リポジトリ要件**: Publicリポジトリまたは有料プラン

### 代替案（必要時）
- **Plan B**: Cloudflare Workers別作成でCron実装
- **Plan C**: 手動実行のみ
- **Plan D**: 外部Cronサービス（cron-job.org等）

---

## 📝 仕様書への影響

### 現在の仕様書記載
```markdown
- `POST /api/cron` - 毎日AM5:00自動チェック（Cron Triggers）
```

### 更新後の記載案
```markdown
- `POST /api/cron` - 毎日AM5:00自動チェック（GitHub Actions Cron）
```

---

**🎯 結論**: GitHub Actionsを使用することで、Cloudflare Pagesの制限を回避し、仕様書通りの自動チェック機能を実現可能。実装は簡単で運用コストも不要。
