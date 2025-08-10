# .ts/.tsx ファイル命名規則ガイド（file-naming-standards-ts.md）
<!-- ENFORCE:NO_NEW_DIRS -->
<!-- 本ドキュメントは AI/自動生成ツールに対して拘束力を持つ運用ポリシーを含みます -->

## 最重要: 既存ディレクトリ構造遵守ポリシー（AI厳格制限）

本プロジェクトは「小規模フェーズ」につき、構造追加による認知負荷増加を避ける。
AI/自動生成は下記を絶対遵守すること:

1. 既存ディレクトリ以外を勝手に新設しない（理由提示＋管理者明示承認が無い限り禁止）作成ファイルの役割上必要な場合はまず打診すること。勝手に判断するな
2. /src 配下へのトップレベル新ディレクトリ作成禁止。必要な場合はまず打診。禁止されているからと勝手に変な場所にディレクトリやファイルを配置しないこと。
3. /src/lib/ 配下への新サブディレクトリ作成禁止。必要な場合はまず打診。禁止されているからと勝手に変な場所にディレクトリやファイルを配置しないこと。
4. 承認プロセス: 管理者が PR もしくは指示文内で `APPROVED_NEW_DIR: <dir-name>` を明示した場合のみ例外
5. 禁止違反案が出た場合は「既存ディレクトリへの配置案」にリライトして再提示すること
6. 例外用途（暫定検証・隔離等）であっても未承認作成は禁止
7. 本ガイド内の後半「型定義配置ポリシー」節で別途規定する constants / types 方針に従うこと（前半では詳細に触れない）

AI 自己チェック（提案前に内部で必ず検証）:
- [ ] 新ディレクトリ名を生成していない
- [ ] 既存構造外のパスを記述していない
- [ ] README / 本ガイドに無い語彙(models, schemas など)のフォルダ提案をしていない
- [ ] 承認タグ無しで構造拡張を企図していない

違反兆候例:
- 「整理のために /src/lib/types を作成しましょう」→ 即座に不許可
- 「将来拡張を見越して features/ を追加」→ YAGNI 原則違反

---

このドキュメントは、本プロジェクトにおける ts および tsx ファイルの命名規則を定めたものです。

## 基本方針
1. Next.jsの標準規約に準拠: _app.tsx, _document.tsx や、ルーティングに基づくファイル名（例: pages/users/[id].tsx）など、フレームワークが定める命名規則を最優先とします。
2. 明瞭性の重視: ファイル名からその役割が推測できる、明瞭で一貫性のある命名を心がけます。
3. 新たなディレクトリは作成しません（詳細は冒頭ポリシー節参照）。
4. 例外の許容: ui/modal/component.tsx のように既存構造上やむを得ないケースは人間が手動でのみ追加。AI は提案しない。

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
(interface / type) は PascalCase。詳細な配置方針は末尾「型定義配置ポリシー」を参照。

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
* 命名規則: [動詞で始まる機能名].ts(x) または [機能の役割].ts(x)
* JSX を含む場合のみ .tsx

## 型定義配置ポリシー（小規模フェーズ特則 / constants 優先集約）
本節は「既存ディレクトリ遵守」(冒頭) と独立した第2議題。
現フェーズでは型専用フォルダ (/src/lib/types, /src/types など) を意図的に導入しない。
理由:
- コスト > 分離メリット（現状規模）
- YAGNI: 必要確定前の抽出は過剰最適化
- 探索パス短縮（認知負荷低減）
- バンドル影響が軽微

運用指針:
1. runtime 定数と密接な 1:1 / 同一概念の型は /src/lib/constants 内同居
2. ファイル内で runtime 値と型をまとめる際、副作用を持つ初期化は最小限に
3. export 時: 型のみを再集約する barrel を今は作らない（早期抽象禁止）
4. AI は型分離理由を提示された場合でも「後述トリガ未到達につき保留」と回答

将来分離検討トリガ（いずれか成立時に初めて提案可）:
- constants 配下の型定義ファイル数 > 15
- 型定義合計行数 > 500（コメント除外目安）
- 型再エクスポート目的の import によりバンドラ警告発生
- 循環参照 2 件以上
- 明確な複数ドメイン境界(auth, billing, analytics 等)が成立

トリガ成立後の段階的移行案（管理者承認後のみ実施）:
- Step 1: 横断コア型 (User, Role, DomainError 等) を /src/lib/types に抽出
- Step 2: constants から型比率を減らし runtime 値中心へ
- Step 3: /src/lib/types/index.ts で export type ... に限定（副作用ゼロ）

AI 禁止行為（再掲: 型配置関連）
- [ ] /src/lib/types 作成提案
- [ ] 型追加のみを理由に別フォルダ抽出提案
- [ ] 未承認フォルダ(models, schemas, dto 等)の創出
- [ ] 「整理」「一般的慣習」だけを根拠とした分離提案

違反検出時のセルフ修正例:
NG: 「型肥大化を避けるため /src/lib/types を作りましょう」
OK: 「現トリガ未達（ファイル数 X, 行数 Y, 循環 0）なので既存 /src/lib/constants に追記します」

管理者専用承認タグ:
`APPROVED_NEW_DIR: /src/lib/types` が明示されるまでは一切移行しない。

---

（以上で「ディレクトリ遵守」と「型定義配置」を明確に分離した運用ポリシーを定義）



