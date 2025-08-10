# JSDoc活用＆コンポーネント実装ガイド

このドキュメントは、プロジェクト内での統一されたJSDoc記述方法とコンポーネント実装パターンを提供します。

## 1. 既存JSDocフォーマット解説

### 1.1 統一された日本語フォーマット

本プロジェクトでは、全ファイルで一貫した日本語JSDoc記述スタイルを採用しています。

#### 基本構成（3行構成）
```javascript
/**
 * ComponentName: コンポーネント/フック名と簡潔な概要
 *
 * 詳細な説明文。機能の詳細、用途、動作の説明を1-2文で記載。
 * さらに詳細が必要な場合は追加の文章で補足。
 *
 * - 特徴や機能のポイント1
 * - 特徴や機能のポイント2
 * - 特徴や機能のポイント3
 *
 * @param paramName パラメータの説明（型情報含む）
 * @example 使用例のコード
 * @remarks 技術的制約、依存関係、注意事項
 */
```

### 1.2 各セクションの使い分け

#### @paramセクション
- 全パラメータの説明を完備
- 型情報と用途を明記
- 省略可能パラメータは明示

#### @exampleセクション
- 基本的な使用例から複数パターンまで網羅
- コメント付きで使用場面を説明
- 実際に動作するコード例を提供

#### @remarksセクション
- 依存関係の明記（必要なライブラリ、CSS）
- 技術的制約（SSR対応、ブラウザ要件等）
- 他コンポーネントとの連携情報

## 2. コンポーネント別実装パターン

### 2.1 UIコンポーネントパターン

**参考実装**: `modalDemo.tsx:9-36`

```javascript
/**
 * ComponentName: コンポーネント名と概要
 *
 * 機能の詳細説明。どのような動作をするか、何のために使用するかを説明。
 * react-modalなどの外部ライブラリを使用する場合はその旨を明記。
 *
 * - 主要機能1
 * - 主要機能2
 * - 主要機能3
 *
 * @param children 子要素の説明（省略時の動作も記載）
 * @param propName その他のプロパティ説明
 *
 * @example
 * // 基本的な使用例
 * <ComponentName />
 *
 * @example
 * // カスタムコンテンツを指定
 * <ComponentName>
 *   <h2>カスタムタイトル</h2>
 *   <p>カスタムコンテンツ</p>
 * </ComponentName>
 *
 * @remarks
 * - 依存ライブラリ名
 * - 使用スタイルファイル
 * - 連携コンポーネント
 */
```

### 2.2 カスタムフックパターン

**参考実装**: `useInView.ts:8-47`

```javascript
/**
 * useHookName: フック名と概要
 *
 * フックの詳細な動作説明。IntersectionObserverなど使用するAPIや
 * パフォーマンス上の利点についても言及。
 *
 * - 技術的特徴1
 * - 技術的特徴2
 * - 技術的特徴3
 *
 * @example
 * // 基本的な使用例
 * function MyComponent() {
 *   useHookName();
 *   return (
 *     <div className="target-class">
 *       <p>フック適用対象要素</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // 複数要素での使用
 * function ScrollPage() {
 *   useHookName();
 *   return (
 *     <div>
 *       <div className="target-class">要素1</div>
 *       <div className="target-class">要素2</div>
 *     </div>
 *   );
 * }
 *
 * @remarks
 * - 対象セレクタ情報
 * - 設定値（閾値等）
 * - SSR対応状況
 * - ブラウザ要件
 */
```

### 2.3 複雑パラメータを持つフックパターン

**参考実装**: `useToggleContent.ts:16-35`

```javascript
/**
 * カスタムフック: useHookName
 *
 * 詳細な機能説明。複数のパラメータを持つ場合は、
 * それぞれのパラメータがどのように連携するかを説明。
 *
 * - 初期状態の説明
 * - 動作フローの説明
 * - 特殊な処理（リサイズ対応等）の説明
 *
 * @param param1 第1パラメータの詳細説明（例: セレクタ文字列）
 * @param param2 第2パラメータの詳細説明（例: イベント対象要素）
 * @param param3 第3パラメータの詳細説明（例: アニメーション対象）
 *
 * @remarks
 * - 必要な要素構造（例: .js-toggle-messageクラス）
 * - 依存ライブラリ（例: GSAPライブラリ）
 * - 実行環境要件（例: Next.js/React環境）
 */
```

## 3. JSDoc記述テンプレート

### 3.1 新規UIコンポーネント用テンプレート

```javascript
/**
 * ComponentName: [コンポーネント名と概要]
 *
 * [機能の詳細説明。どのような動作をするか、何のために使用するか]
 * [外部ライブラリを使用する場合はその旨を明記]
 *
 * - [主要機能1]
 * - [主要機能2]
 * - [主要機能3]
 *
 * @param children [子要素の説明（省略時の動作も記載）]
 * @param [propName] [その他のプロパティ説明]
 *
 * @example
 * // 基本的な使用例
 * <ComponentName />
 *
 * @example
 * // [応用例の説明]
 * <ComponentName prop="value">
 *   [カスタムコンテンツ例]
 * </ComponentName>
 *
 * @remarks
 * - [依存ライブラリ名]
 * - [使用スタイルファイル]
 * - [連携コンポーネント]
 */
```

### 3.2 新規カスタムフック用テンプレート

```javascript
/**
 * useHookName: [フック名と概要]
 *
 * [フックの詳細な動作説明。使用するAPIやパフォーマンス上の利点]
 * [対象要素や動作トリガーについての説明]
 *
 * - [技術的特徴1]
 * - [技術的特徴2]
 * - [技術的特徴3]
 *
 * @param [paramName] [パラメータの説明（省略可能な場合は明記）]
 *
 * @example
 * // 基本的な使用例
 * function MyComponent() {
 *   useHookName();
 *   return (
 *     [使用例のJSX]
 *   );
 * }
 *
 * @example
 * // [応用例の説明]
 * function [ComponentName]() {
 *   useHookName([パラメータ]);
 *   return (
 *     [応用例のJSX]
 *   );
 * }
 *
 * @remarks
 * - [対象セレクタ情報]
 * - [設定値や閾値]
 * - [SSR対応状況]
 * - [ブラウザ要件]
 */
```

### 3.3 新規ユーティリティ関数用テンプレート

```javascript
/**
 * functionName: [関数名と概要]
 *
 * [関数の詳細な機能説明。入力から出力への変換処理内容]
 * [特殊な処理や計算ロジックがある場合はその説明]
 *
 * @param param1 [第1パラメータの説明と型情報]
 * @param param2 [第2パラメータの説明（省略可能な場合は明記）]
 * @returns [戻り値の説明と型情報]
 *
 * @example
 * // 基本的な使用例
 * const result = functionName(value1, value2);
 *
 * @example
 * // [応用例の説明]
 * const [変数名] = functionName([パラメータ例]);
 *
 * @remarks
 * - [依存関係]
 * - [制約事項]
 * - [パフォーマンス上の注意]
 */
```

## 4. ベストプラクティス

### 4.1 依存関係の明記方法

#### 外部ライブラリ依存
```javascript
@remarks
- react-modalライブラリが必要です
- GSAPライブラリが必要です
- scroll-hintが必要です
```

#### CSS/SCSSファイル依存
```javascript
@remarks
- button.module.scssスタイルを使用
- toggle.module.scssが必要
- グローバルクラス .c-toggle__wrap を使用
```

#### 他コンポーネントとの連携
```javascript
@remarks
- ModalComponentと組み合わせて動作
- HeaderComponentから呼び出される想定
- useInViewフックと併用可能
```

### 4.2 技術的制約の書き方

#### SSR対応
```javascript
@remarks
- SSR対応済み（typeof window チェック）
- Next.js/React環境で利用してください
```

#### ブラウザ要件・環境制約
```javascript
@remarks
- IntersectionObserver API が必要（IE非対応）
- 768px以下をモバイルとして判定
- PC閾値: 0.3、SP閾値: 0.4（調整可能）
```

#### DOM構造要件
```javascript
@remarks
- タイトル要素の親に`.js-toggle-message`クラスの要素が必要
- 監視対象は「.inview__fadein」クラスを持つ要素
```

### 4.3 使用例の効果的な記述方法

#### 基本例→応用例の順番
1. **基本例**: 最小限のコードで基本機能を示す
2. **カスタマイズ例**: プロパティを使用した応用
3. **複合例**: 他のコンポーネントとの組み合わせ

#### コメントによる説明
```javascript
@example
// 基本的な使用例（デフォルトコンテンツ）
<SimpleModalDemo />

@example
// カスタムコンテンツを指定
<SimpleModalDemo>
  <h2>カスタムタイトル</h2>
  <p>カスタムコンテンツです</p>
</SimpleModalDemo>
```

### 4.4 記述時の注意点

1. **一貫性の保持**: プロジェクト内の既存JSDocフォーマットに合わせる
2. **実用性重視**: 実際に動作するコード例を提供
3. **制約の明記**: 依存関係や技術的制約は必ず@remarksに記載
4. **日本語統一**: 全て日本語で記述し、専門用語は適切に使用

---

**最終更新**: 2025-07-31
**参考実装**: useInView.ts, modalDemo.tsx, useToggleContent.ts