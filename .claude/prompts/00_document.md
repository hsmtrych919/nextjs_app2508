```markdown
# サテライト投資管理Webアプリ 仕様書 v2.1

## 概要
6000ドルのサテライト投資資金を効率的に管理するためのWebアプリケーション。フォーメーション戦略に基づく資金配分と銘柄管理を行う。

## 技術仕様
- **フレームワーク**: Next.js 14+ (TypeScript)
- **スタイリング**: プロジェクトフォルダのscssガイド(docs/以下)参照
- **UI コンポーネント**: Radix UI
- **状態管理**: Zustand
- **フォーム管理**: React Hook Form
- **アイコン**: Lucide React
- **数値計算**: Decimal.js
- **日時処理**: date-fns
- **ユーティリティ**: clsx
- **デプロイ**: Cloudflare Pages
- **API**: Next.js API Routes → Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **認証**: なし（後で追加可能）

## 主要機能

### 1. フォーメーション選択
5つのフォーメーションから選択（表示順）：
- **3銘柄 50-30-20%型**: 3000-1800-1200ドル
- **4銘柄 35-30-20-15%型**: 2100-1800-1200-900ドル
- **5銘柄 30-25-20-15-10%型**: 1800-1500-1200-900-600ドル
- **フルポジ**: 表示のみ（入力不要）
- **ノーポジ**: 表示のみ（入力不要）

### 2. 銘柄管理
- 監視銘柄は `lib/const/ticker.json` で管理
- 初期値: `["AMZN", "AVGO", "COIN", "CONL", "GEV", "GOOG", "HOOD", "LEU", "META", "MSFT", "NBIS", "NET", "NFLX", "NOW", "NVDA", "OKLO", "ORCL", "PLTR", "RKLB", "U", "ZS"]`
- Radix UIのSelectコンポーネントで選択
- 銘柄変更時は手動編集 → 再デプロイ

### 3. 投資計算機能
各銘柄について：
- ティッカーシンボル選択（Ticker）
- 現在価格入力（Entry）- 数値キーボード
- 保有株数入力（Hold）- 数値キーボード
- 目標株数表示（Goal）- 自動計算
- 「Hold/Goal」形式で表示（例：5/8）
- 目標株数計算: 目安金額 ÷ 現在価格（小数点第2位四捨五入）

### 4. 予算管理
- 総予算設定（Funds）- デフォルト6000ドル、変更可能
- スタート地点金額（Start）
- 利確額（Profit）
- 年利％（Return）- 自動計算表示

### 5. フォーメーション使用率追跡
- 毎日AM5:00（日本時間）に自動チェック
- フォーメーション変更検知で使用カウント+1
- 使用率表示: 「フォーメーション名 : 使用率%」形式

## 画面構成
### レイアウト構造
1. **上部**: フォーメーション選択（Formation）
2. **中部**: Tier別銘柄入力セクション
   - Tier1～5（選択フォーメーションにより動的変更）
   - 各Tier: Balance(%), Estimate($), Ticker, Entry, Hold/Goal
3. **下部**: 予算管理エリア
   - Funds, Start, Profit, Return(%)
4. **最下部**: Formation Usageエリア
   - シンプルなテキスト表示: 「3銘柄 50-30-20%型: XX%」形式

### UI詳細仕様
- **Formation**: Radix Select、選択により下部Tier数が動的変更
- **Ticker**: Radix Select、監視銘柄から選択
- **Entry/Hold**: 数値キーボード対応入力
- **Goal**: 自動計算結果表示（読み取り専用）
- **Hold/Goal**: 「5/8」形式で併記表示
- **Balance**: パーセンテージ表示
- **Estimate**: ドル金額表示

## データベース設計（Drizzle ORM）
### テーブル構成
- **formations**: フォーメーション使用履歴
- **settings**: アプリ設定（総予算、スタート地点等）
- **holdings**: 銘柄保有状況

## UI/UX要件
- **シングルページ**: 全情報を1画面で表示
- **モバイル専用**: スマホ表示のみ（レスポンシブ不要）
- **ダークモード対応**: しない
- **アクセシビリティ**: Radix UI標準対応
- **エラーハンドリング**: 設計で回避（最小化）

## 状態管理（Zustand）
```typescript
interface AppState {
  currentFormation: FormationType
  totalBudget: number
  startAmount: number
  realizedProfit: number
  holdings: Holding[]
  formationStats: FormationStats
}
```

## ファイル構造
```
src/
├── app/
├── components/
│   ├── FormationSelector.tsx
│   ├── StockInput.tsx
│   └── StatsDisplay.tsx
├── lib/
│   ├── const/
│   │   └── ticker.json
│   └── utils/

以下制作ガイドおよび既存ファイルに準拠
```

## API エンドポイント（Next.js API Routes → Cloudflare Workers）
- `GET /api/data` - 全データ取得（フォーメーション、設定、保有状況、使用率）
- `POST /api/data` - 全データ更新・保存
- `POST /api/cron` - 毎日AM5:00自動チェック（Cron Triggers）

## 開発・運用方針
- **無料利用枠内**: Cloudflareの無料プラン活用
- **シンプル実装**: 複雑な機能より使いやすさ優先
- **拡張性**: 後から機能追加しやすい設計
- **型安全**: TypeScript活用でバグ防止

## 次のステップ
Claude Codeでの開発実行
- 画像添付による画面デザイン共有
- 本仕様書による詳細要件伝達

---
**バージョン履歴**
- v1.0: 初回作成
- v2.0: API設計をシンプルな統合型に変更、レスポンシブ対応を削除
- v2.1: 画面構成詳細化、ティッカー初期値追加、UI仕様明確化
```