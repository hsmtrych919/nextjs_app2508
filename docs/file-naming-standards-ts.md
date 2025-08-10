# .ts/.tsx ファイル命名規則ガイド（file-naming-standards-ts.md）

このドキュメントは、本プロジェクトにおける ts および tsx ファイルの命名規則を定めたものです。

## 基本方針

1. Next.jsの標準規約に準拠: _app.tsx, _document.tsx や、ルーティングに基づくファイル名（例: pages/users/[id].tsx）など、フレームワークが定める命名規則を最優先とします。
2. 明瞭性の重視: ファイル名からその役割が推測できる、明瞭で一貫性のある命名を心がけます。
3. 新たなディレクトリは作成しません。既存のディレクトリ構造に適合するように命名します。
4. 例外の許容: ui/modal/component.tsx のように、既存のディレクトリ構成や分類の都合上、本規則に当てはめることが難しいファイルは例外として扱います。ただし、例外の許可および作成は人間が手動で行い、AIによる自動生成は行いません。これにより、意図しない無秩序な命名の乱立を防ぎます。


## 関数・変数命名規則

### 基本（camelCase）
プロジェクト全体の標準的な命名規則として、camelCaseを使用します。
- **ファイル名**: `smoothScroll.ts`, `useTabSwitch.ts`, `buttonDemo.tsx`
- **関数名**: `getUserData()`, `formatDate()`, `calculateTotal()`
- **変数名**: `userName`, `isLoading`, `currentIndex`
- **特殊プレフィックス**:
 - カスタムフック: `use*` + camelCase（例: `useInView`, `useTabSwitch`）
 - イベントハンドラー: `handle*` + camelCase（例: `handleClick`, `handleSubmit`）
 - イベントプロパティ: `on*` + camelCase（例: `onSubmit`, `onChange`）
 - boolean変数: `is*`, `has*`, `should*` + camelCase（例: `isVisible`, `hasError`, `shouldRender`）
 - HOC: `with*` + camelCase（例: `withAuth`, `withTheme`）

### ケース1: Reactコンポーネント（PascalCase）
`src/components/`ディレクトリ内のファイルおよび関数のみ、PascalCaseを使用します。
- **ファイル名**: `ButtonDemo.tsx`, `UserProfile.tsx`, `ModalDemo.tsx`
- **関数名（コンポーネント）**: `ButtonDemo()`, `UserProfile()`, `ModalDemo()`
- **理由**: ReactがHTML要素とカスタムコンポーネントを区別するための技術的要件

### ケース2: Next.js pages/ディレクトリ（kebab-case）
Next.jsのルーティングシステムに合わせて、pages/ディレクトリ内のファイルはkebab-caseを使用します。
- **基本**: kebab-case（例: `user-profile.tsx`, `about-us.tsx`）
- **例外**: Next.js規約ファイル（`_app.tsx`, `_document.tsx`）
- **単語1つ**: そのまま（`index.tsx`, `404.tsx`）
- **理由**: URLとの整合性、Next.jsコミュニティの標準慣習


### ケース3: 定数（SCREAMING_SNAKE_CASE）
プロジェクト全体で使用される定数には、SCREAMING_SNAKE_CASEを使用します。
- **定数**: `API_URL`, `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`
- **用途**: 設定値、エンドポイント、制限値など変更されない値

### ケース4: TypeScript型定義（PascalCase）
TypeScriptの型定義においてPascalCaseを使用します。
- **interface**: `UserProfile`, `ButtonProps`, `ApiResponse`
- **type**: `ThemeMode`, `SortDirection`, `ValidationError`
- **理由**: TypeScriptコミュニティの標準的な慣習

### ファイル拡張子の使い分け
TypeScriptファイルの拡張子は、JSX（HTML要素）の有無によって決定します。

- **`.tsx`**: JSX（HTML要素）を含むファイル
 - 例: コンポーネント、JSXを返すユーティリティ
 - `ButtonDemo.tsx`, `rewritePath.tsx`

- **`.ts`**: JSX（HTML要素）を含まないファイル
 - 例: カスタムフック、ユーティリティ関数、型定義
 - `useTabSwitch.ts`, `smoothScroll.ts`, `formatDate.ts`

- **背景**: TypeScriptコンパイラがJSXシンタックスを認識するための技術的要件です。


## 関数・変数命名規則（詳細）

### コンポーネント (src/components/)
コンポーネントは、その役割に応じて以下の規則で命名します。

#### 機能別コンポーネント (src/components/features/)
現状: 廃止

廃止理由: 現在のプロジェクト規模では、コンポーネントの抽象度による分類（ui/ と layout/）で十分対応可能です。features/ ディレクトリを設けることで、かえって分類基準が曖昧になり、AI開発時の判断に迷いが生じるリスクがあります。
代替手段: ページ固有のコンポーネントが必要になった場合は、pages/[ページ名]/ ディレクトリを新設して対応します。
将来的な対応: プロジェクトが拡大し、複数の ui/ コンポーネントを組み合わせた機能単位のコンポーネントが頻繁に発生するようになった場合は、features/ ディレクトリの再導入を検討します。その際は、明確な分類基準とともに事前確認を行います。
背景: YAGNI原則（You Aren't Gonna Need It）に基づき、現在不要な構造は避けることで、開発効率とコードの可読性を優先しています。


####  レイアウトコンポーネント (layout/)

サイトの骨格を形成する、特定の区画に特化したコンポーネントです。
* 命名規則: [レイアウトの区画名].tsx
* 例: layout.tsx, header.tsx, footer.tsx, sidebar.tsx
* 背景: この命名は、Next.jsコミュニティにおけるデファクトスタンダードです。特に layout.tsx は、Next.jsのApp Routerにおいて特別な意味を持つ予約ファイル名であり、将来的な移行を見据えても合理的です。


#### Demo用コンポーネント (ui/)

開発用のUIカタログ（snippet.tsx）で表示するためのコンポーネントです。
* 命名規則: [機能名]Demo.tsx
* 例: buttonDemo.tsx, modalDemo.tsx, tableDemo.tsx
* 用途: snippet.tsx での開発用一覧表示専用。
* 内容: 外部からのpropsに依存せず、コンポーネント自体が固定のサンプルデータを持ちます。

#### 実用コンポーネント (ui/)

実際のアプリケーションで使用する、再利用可能な汎用コンポーネントです。
* 命名規則: [機能名][用途・型式].tsx
* 例: modalConfirm.tsx, modalImageViewer.tsx, tabVertical.tsx
* 用途: 実際のプロジェクトで汎用的に使用します。
* 内容: props を介してデータを受け取り、様々な場面で利用できる柔軟な設計とします。





### ロジック (src/lib/)

再利用可能なロジックは、その種類に応じて以下の規則で命名します。

#### カスタムフック (lib/hooks/)

コンポーネントからロジックを分離し、再利用するための関数です。
* 命名規則: use[動詞で始まる機能名].ts
* 例: useInView.ts, useTabSwitch.ts, useTableScroll.ts
* 背景: ファイル名を use で始めるのは、React公式が定めるカスタムフックのルールです。これにより、Reactがフックのルール違反をチェックできるようになります。

#### ユーティリティ関数 (lib/utils/)

プロジェクト全体で利用されるヘルパー関数です。
* 命名規則: [動詞で始まる機能名].ts(x) または [機能の役割].ts(x)
* 例: smoothScroll.ts, rewritePath.tsx, formatDate.ts
* 背景: ユーティリティの命名に厳密なルールはありませんが、ファイル名自体がその役割を明確に説明することがコミュニティ全体の慣習です。JSXを含む場合は拡張子を .tsx とします。



