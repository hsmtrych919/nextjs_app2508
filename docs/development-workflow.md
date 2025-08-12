# Development Workflow Guide

このドキュメントは、Next.js TypeScriptプロジェクトの開発フローと利用可能なコマンドを体系化したガイドです。

## 利用可能コマンド一覧

### Core Development Commands

#### `npm run dev`
- **用途**: 開発サーバーの起動
- **説明**: ホットリロード付きの開発環境を起動
- **使用場面**: 日常的な開発作業時

#### `npm run build`
- **用途**: 開発ビルド（ローカルテスト用）
- **説明**: prefixPathを適用しない静的エクスポート
- **重要**: ローカルでの動作確認専用

#### `npm run build`
- **用途**: プロダクションビルド（デプロイ用）
- **説明**: 静的エクスポートファイルを生成
- **注意**: デプロイサーバー用の設定が適用される

#### `npm run start`
- **用途**: 本番サーバーの起動
- **説明**: ビルド済みファイルでサーバーを起動

#### `npm run serve`
- **用途**: 静的ファイルの配信
- **説明**: `_dist`ディレクトリから静的ファイルを配信
- **使用場面**: ビルド後の動作確認

### Code Quality Commands

#### `npm run eslint`
- **対象ファイル**: `pages/**/*.{ts,tsx}`, `components/**/*.{ts,tsx}`, `features/**/*.{ts,tsx}`
- **機能**: ESLintによる自動修正（--fix）
- **説明**: TypeScript/TSXファイルのコード品質チェックと自動修正

### Asset Optimization Commands

#### `npm run imgmin`
- **用途**: 画像最適化
- **説明**: imagemin設定に基づく画像ファイルの最適化処理
- **対象**: プロジェクト内の画像ファイル

## 開発ワークフロー

### 1. 日常開発フロー

```bash
# 1. 開発サーバー起動
npm run dev

# 2. 開発作業...

# 3. コード品質チェック
npm run eslint
```

### 2. 動作確認フロー

**重要**: 変更内容は必ず静的エクスポート環境で確認すること

```bash
# 1. 開発ビルド作成
npm run build

# 2. 静的ファイル配信で確認
npm run serve

# 3. ブラウザで http://localhost:3000 にアクセスして動作確認
```

### 3. 本番デプロイ準備フロー

```bash
# 1. プロダクションビルド作成
npm run build

# 2. 静的ファイル配信で最終確認
npm run serve

# 3. デプロイ先への配置
# （具体的な手順は要相談）
```

## 重要な技術的考慮事項

### Dual Environment Build System

このプロジェクトは二重環境ビルドシステムを採用：

- **開発/テスト環境**: `npm run build` - 開発用ビルド
- **本番環境**: `npm run build` - プロダクション用ビルド

### Path Management

- 全ての画像・リンクは`@features/rewrite-path.tsx`のカスタムコンポーネントを使用
- `ImgPath`コンポーネント: 画像パスのbasePath処理とキャッシュバスティング
- `LinkPath`コンポーネント: 内部リンクの適切なパス処理

### Static Export設定

- **出力形式**: `'export'`（静的サイト生成）
- **出力ディレクトリ**: `'_dist'`
- **URL形式**: `trailingSlash: true`（ディレクトリベースURL）

## ベストプラクティス

### 1. 必須確認手順

変更後は必ず以下を実行：

1. `npm run build` → `npm run serve` による静的エクスポート動作確認
2. コード品質チェック（`npm run eslint`）

### 2. ファイルパス管理

- 画像パスは必ず`ImgPath`コンポーネントを使用
- 内部リンクは必ず`LinkPath`コンポーネントを使用
- SCSS内の背景画像はビルド時に自動処理される

### 3. TypeScript設定

パスエイリアス設定済み：
- `@components/*` → `components/*`
- `@features/*` → `features/*`
- `@styles/*` → `styles/*`

## Browser Compatibility

- **開発時**: 最新2バージョン対象
- **本番時**: 必要に応じてより広範囲な対応可能

## 注意事項

1. **Interactiveコマンドの制限**: `git rebase -i`や`git add -i`等のインタラクティブコマンドは使用不可
2. **デプロイフロー**: 具体的なデプロイ手順は現在未確定のため、必要時に相談
3. **画像最適化**: 新しい画像追加時は`npm run imgmin`の実行を推奨

---

**最終更新**: 2025-07-31
**対象環境**: Next.js 13.5, TypeScript, SCSS