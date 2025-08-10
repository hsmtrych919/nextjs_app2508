# SCSS スタイリングガイド

このドキュメントは、プロジェクトのSCSS体系と新クラス作成時の判断指針を提供します。

## 1. SCSS体系概要

本プロジェクトは、**CSS Modules層**と**グローバル層**の2つの大きな層に分かれ、さらにグローバル層は6つの副層で構成される7層構造を採用しています。

### 1.1 全体構造

```
src/styles/
├── modules/          # CSS Modules層（ハッシュ化適用）
└── global/           # グローバル層（6つの副層）
    ├── foundation/   # Foundation層
    ├── global/       # Global層
    ├── mixins/       # Mixins層
    ├── layout/       # Layout層
    ├── component/    # Component層
    ├── project/      # Project層
    └── utility/      # Utility層
```

### 1.2 CSS Modules層（src/styles/modules）

**ハッシュ化されるコンポーネント固有スタイル** - 初期状態 以下7ファイル

- `grid.module.scss`: グリッドシステム（`col--12`, `row--container`）
- `button.module.scss`: ボタンバリエーション（`base--thin`, `icon--arrow`）
- `gutter.module.scss`: レイアウト調整（`container--initial`, `small--left`）
- `type.module.scss`: タイポグラフィ（`title--xsmall`, `text--marker`）
- `index.module.scss`: ページ用スタイル（pages/index.tsx専用）
- `header.module.scss`: ヘッダーコンポーネント用（.outer, .logo）
- `footer.module.scss`: フッターコンポーネント用（.outer）

**特徴**: 全ファイルがBEM準拠の`element--modifier`形式（Block役割はファイル名）

### 1.3 グローバル層（src/styles/global）

#### Foundation層（基盤・リセット）
- `_destyle.css`: CSSリセット
- `_reboot.scss`: Bootstrap風基本スタイルリセット
- `_variables*.scss`: カラー・フォーム・基本変数定義（3ファイル）

#### Global層（共通定義・関数）
- `_breakpoints.scss`: ブレークポイント定義
- `_media-queries.scss`: メディアクエリ関数群
- `_font.scss`: フォント設定
- `_calc.scss`: 計算関数
- `_unicode.scss`: 文字コード関連
- `_index.scss`: global層統合ファイル

#### Mixins層（SCSS関数・ミックスイン）
- `_hover.scss`: ホバー効果
- `_gutter.scss`: 余白設定ミックスイン
- `_transition.scss`: アニメーション
- `_zindex.scss`: z-index管理
- `_clearfix.scss`, `_dl.scss`, `_table-row.scss`: 個別機能（7ファイル計）

#### Layout層（レイアウト定義）
- `_grid-variables.scss`: グリッドシステム変数

#### Component層（コンポーネント固有グローバルスタイル）

**以下理由によりモジュール化せずにグローバルスタイルとして維持：**
- `react-modal`や`swiper`など外部ライブラリのクラスを上書きする
- JavaScript連携、動的クラス操作等でハッシュ化されると.ts/.tsxの動作に影響する

- `_toggle.scss`: トグル機能（`c-toggle__wrap`系・JavaScript連携）
- `_tab.scss`: タブ機能
- `_table.scss`: テーブル機能
- `react-modal/_react-modal.scss`: React Modal用
- `swiper/_swiper-bundle.scss`: Swiper用（コメントアウト済み）

#### Project層（プロジェクト固有）
- `_style.scss`: プロジェクト全体スタイル・CSS変数・アニメーション定義ほか

#### Utility層（汎用ユーティリティクラス）
- `_flex.scss`: Flexboxユーティリティ（`jc-center`, `ai-center`等）
- `_display.scss`: 表示制御ユーティリティ
- `_margin.scss`, `_padding.scss`: 余白調整
- `_font.scss`, `_visibility.scss`, `_responsive-embed.scss`, `_scroll-hint.scss`, `_tables.scss`（8ファイル計）

## 2. 優先順位とファイル選択ルール

### 2.1 基本優先順位（3段階）

#### 優先順位1: プロジェクト層 + ページ用モジュール
**原則として以下に新規クラスを作成**：
- `src/styles/global/project/_style.scss`
- `src/styles/modules/`内のページ用モジュール
- ページ用モジュールがない場合は作成を許可

#### 優先順位2: コンポーネント専用モジュール作成
**機能をコンポーネント化する旨の指示があれば**：
- `src/styles/modules/`内にコンポーネント専用のモジュールを作成
- **ただし例外**: クラス名のハッシュ化が.ts/.tsxの動作に影響する場合は`src/styles/global/component/`内にファイル作成してグローバルクラスとして記載

#### 優先順位3: ユーティリティクラスの活用
**utility/の使用について**：
- `.hghg {margin-top: 12px;}`のような汎用的かつ簡素で単純なクラスを作らせないため
- 煩雑なクラスの乱立を避けるためにutility/のクラスを活用
- 複数の要素が絡むスタイリングの場合は、基本的に優先順位1を優先させる

### 2.2 特別な考慮事項

#### モジュール化の慎重な判断
- 特定機能に特化したクラス群やコンポーネントに付属するクラス群は、モジュール化して`src/styles/modules/`に配置したい
- あらゆるケースを事前想定することは不可能なため、**勝手には進めず必ず確認と許可を得ること**

#### グローバルクラスとして追加する場合
**以下の場合はハッシュ化を避けグローバルクラスを維持**：
- クラス名のハッシュ化がJavaScript連携、動的クラス操作等で.ts/.tsxの動作に影響する場合

#### utility/の位置づけ
- **利用するだけ**: SCSSスタイリング指針として活用
- **最小限の作成**: 人間の指示を起点とした必要時のみの作成・更新

## 3. BEM記法とクラス命名規則

### 3.1 基本BEM記法

本プロジェクトは**基本的にBEM記法に準拠**し、以下の命名規則を適用します。

#### CSS Modules内での命名
```scss
// [機能名].module.scss形式
// 内部クラス: element--modifier形式（Block役割はファイル名）

// button.module.scss
.base {           // Block（ファイル名がBlock役割）
  // スタイル

  &--thin {       // Modifier
    // バリエーション
  }
}

.icon--arrow {    // Element--Modifier
  // アイコン用スタイル
}
```

#### グローバルSCSS内での命名
```scss
// _[機能名].scss形式
// BEM記法: Block__Element--modifier形式

// _toggle.scss
.c-toggle__wrap {        // Block__Element
  // ラップ要素
}

.c-toggle__button {      // Block__Element
  // ボタン要素
}

.c-toggle__wrap--active { // Block__Element--Modifier
  // アクティブ状態（必要に応じて）
}
```

### 3.2 ブレークポイント接頭辞の適切な使い分け

**関数選択指針（確定版）**：
```scss
// ブレークポイント接頭辞の適切な使い分け
breakpoint-infix-element($bp)   // __sm
breakpoint-infix-modifier($bp)  // --sm
breakpoint-infix($bp)           // -sm
```

### 3.3 例外規定

**以下の場合はBEM記法の対象外とする**：

#### 外部ライブラリのクラス
```scss
// 対象外: react-modalやswiperなど
.ReactModal__Overlay {
  // 外部ライブラリのクラス上書き
}
```

#### 状態クラス
```scss
// 対象外: JavaScriptで動的に付与される状態クラス
.is-active {
  // 動的状態クラス
}

.is-inview {
  // インビューアニメーション用
}
```

#### JavaScript連携が必要な機能
```scss
// 対象外: 固有クラス名に依存する機能はグローバルスタイル維持
.js-toggle-wrap {
  // JavaScript側で要素選択に使用
}
```

## 4. 実装例とベストプラクティス

### 4.1 新規ページスタイル作成例

```scss
// src/styles/modules/about.module.scss（新規作成）
.hero {
  // ページ固有のヒーローセクション

  &--large {
    // 大型バリエーション
  }
}

.content {
  // メインコンテンツ
}
```

### 4.2 プロジェクト共通スタイル追加例

```scss
// src/styles/global/project/_style.scss（既存ファイルに追加）
.inview__fadein {
  transform: translateY(30px);
  opacity: 0;
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.is-inview {
  transform: translateY(0);
  opacity: 1;
}
```

### 4.3 新規コンポーネント用モジュール作成例

```scss
// src/styles/modules/card.module.scss（新規作成）
.base {
  border: 1px solid var(--clrg300);
  border-radius: var(--bdrs);

  &--shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.header {
  padding: 1rem;
  border-bottom: 1px solid var(--clrg200);
}

.body {
  padding: 1rem;
}
```

### 4.4 JavaScript連携コンポーネント例

```scss
// src/styles/global/component/_carousel.scss（新規作成）
.c-carousel__wrap {
  position: relative;
  overflow: hidden;
}

.c-carousel__slide {
  transition: transform 0.3s ease;
}

.c-carousel__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  &--prev {
    left: 1rem;
  }

  &--next {
    right: 1rem;
  }
}
```

### 4.5 ユーティリティクラス活用例

```scss
// 既存utility/クラスの活用
<div className="jc-center ai-center">
  <p className="mt-0 mb-1">
    ユーティリティクラス使用例
  </p>
</div>
```

## 5. 判断フローチャート

### 5.1 新規スタイル作成時の判断手順

```
1. 既存ユーティリティクラスで対応可能か？
   Yes → 既存クラス使用
   No ↓

2. ページ固有のスタイルか？
   Yes → modules/[page].module.scss に作成
   No ↓

3. 複数ページで使用する共通スタイルか？
   Yes → global/project/_style.scss に作成
   No ↓

4. 特定コンポーネント専用か？
   Yes → JavaScript連携が必要？
         Yes → global/component/ に作成
         No → modules/[component].module.scss に作成
   No ↓

5. システム全体に影響する基盤的変更か？
   Yes → 該当するglobal層ファイルに追加
```

### 5.2 CSS Modules vs グローバルクラスの判断

#### CSS Modules使用ケース
- コンポーネント固有のスタイル
- ハッシュ化によるスコープ分離が有効
- JavaScript連携が不要

#### グローバルクラス使用ケース
- JavaScript側でクラス名を参照する必要がある
- 外部ライブラリとの連携が必要
- 動的なクラス操作が必要
- プロジェクト全体で共通使用

## 6. メンテナンス指針

### 6.1 既存クラスの調査

新規作成前に以下を確認：
```bash
# 類似クラスの存在確認
grep -r "similar-class" src/styles/

# 既存ユーティリティクラス確認
grep -r "margin\|padding\|flex" src/styles/global/utility/
```

### 6.2 命名の一貫性確保

- **接頭辞**: コンポーネント系は `c-`
- **状態**: 状態クラスは `is-` または `js-`
- **BEM記法**: `Block__Element--Modifier`の徹底

### 6.3 ドキュメント更新

新規パターン作成時は本ガイドの更新も検討してください。

---

**最終更新**: 2025-07-31
**基準ドキュメント**: 02_plan-make-guide-accurate.md
**対象環境**: Next.js 13.5, TypeScript, SCSS