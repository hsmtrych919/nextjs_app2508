# NextJS TypeScript スターターテンプレート
ssg（静的html）サイト用プリセット

## 技術構成
- **Next.js 13.5** (App Router非使用)
- **TypeScript 5.8** 各ファイルを.ts, .tsxに拡張子変更
- **SCSS** (GSAP, React Modal対応)
- **eslint, prettier, stylelint** 設定済み

## 主要機能 - 更新:2025年7月23日

### レイアウトシステム
- `src/components/layout/layout.tsx` - メインレイアウト（機能初期化を含む）
- `src/components/layout/header.tsx` - ヘッダー（ロゴ部分は「logo.png」を参照）
- `src/components/layout/footer.tsx` - フッター（「ダミーテキストです。」を含む）

### UI要素コンポーネント
- `src/components/ui/modal.tsx` - モーダルデモ（React Modal統合）
- `src/components/ui/toggle.tsx` - トグルデモ（GSAP連携）
- `src/components/ui/button.tsx` - ボタンコンポーネント
- `src/components/ui/modal/component.tsx` - React Modalコンポーネント

### 機能モジュール
- `src/lib/hooks/toggle-content.tsx` - GSAPを使用したトグルアニメーション（カスタムフック）
- `src/lib/hooks/useInView.tsx` - IntersectionObserver hook
- `src/lib/utils/smooth-scroll.tsx` - スムーズスクロール機能
- `src/lib/utils/rewrite-path.tsx` - 環境間でのパス管理ユーティリティ
- `src/lib/utils/link_ignore.tsx` - リンク無効化機能



# メモ

## 背景画像のパス
background-image: url(../../../public/img/bgi_cloth01.png);
../はローカルの階層に合わせる
これでビルド時にbgiが _next/static/media/内に生成されてurlも修正してくれる
* 利用していないクラスの場合はビルド時エラーとなるので注意



