02_plan-make-guide.md の
#### 理由
- **最重要**: CSS Modules vs グローバルクラスの使い分けが現在不明確
- **実用性**: 毎回のスタイリング作業で参照される
- **複雑性**: ハイブリッド構成の理解が必要

に同意できない。


### 3. scss 命名規則の統一

#### 統一されたSCSS命名規則体系
BEM記法最適化により、以下の分類を採用：

**分類体系**:
- **純粋ユーティリティ**: `property-value` (例: `mt-12`, `jc-center`)
- **プロジェクト固有のグローバルクラス**: src/styles/global/project/_style.scss では新規クラスにBEM記法適用
- **機能・ページモジュール**: CSS Modulesでの完全BEM記法適用
- **コンポーネントモジュール**: `element--modifier` (ファイル名がBlock役割)

#### CSS Modules環境でのBEM記法最適化
```scss
// 従来の冗長な形式を回避
.button__icon--arrow → button_button__icon--arrow__hash  // ❌ 冗長

// 最適化されたBEM記法
.icon--arrow → button_icon--arrow__hash  // ✅ 効率的
// Block: button(ファイル名) + Element: icon + Modifier: arrow
```

aiは grid.module.scss の内容を正しく理解出来ないケースが多い。

- 基本クラス: col--12
- ブレークポイント付き: col--lg-10, col--xl-7
(全てダブルハイフン)
など。ファイル内の書式が複雑なため、誤解のないように注意させるドキュメントが必要。


#### 実装方針と例外規定
- **統一適用**: button.module.scss, type.module.scss などsrc/styles/modules/ 内のコンポーネントモジュールで `element--modifier` 形式適用
- **理論的正確性**: ファイル名がBlock役割を担い、冗長性を排除。完全なBEM記法準拠（Block__Element--Modifier）
- **実用性**: CSS Modules環境に最適化された出力効率

**例外規定**: 以下の場合はBEM記法の対象外とする。
- **外部ライブラリのクラス**: `react-modal`や`swiper`など
- **状態クラス**: JavaScriptで動的に付与される状態クラス（`.is-active`, `.is-inview`）
- **JavaScript連携が必要な機能**: 固有クラス名に依存する機能はグローバルスタイル維持

### 3-1. src/styles/以下のディレクトリ構造について
現状のディレクトリ構成を遵守し変更しない。必要に応じて、`src/styles/global/component/` や `src/styles/global/layout/` などのディレクトリを利用し、適切な場所にスタイルを配置するが、作成時には必ず確認し勝手に追加、変更しない。


### 4. スタイリング方針について

#### 基本方針
- **優先順位**: ページ用モジュール → component/ → 必要時のみutility/
- **utility/ の位置づけ**: 利用するだけ、SCSSスタイリング指針として活用
- **utility/ クラスは最小限**: 人間の指示を起点とした必要時のみの作成・更新

読んだか？
現状のsrc/styles/ 以下のファイルを記載内容確認したか？

表面的すぎる。
現状を正しく理解して .claude/tmp/02_plan-make-guide.md を更新しろ