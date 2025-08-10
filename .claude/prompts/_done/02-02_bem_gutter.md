# モジュール化済みファイル内クラスのBEM準拠検討

## 対象ファイル
src/styles/module/ 内のファイル

## 除外ファイル
以下はクラスなし、および現段階ではクラス作成の必要性なしのため除外
index.module.scss
header.module.scss
footer.module.scss

## 各ファイルの変更方針

1つずつ進行

### gutter.module.scss

#### 内部クラスのBEM準拠
モジュール化したことで、ファイル内のクラスはグッターであること確定していること、出力には内部クラスは モジュール名からの 'gutter' が付属されることなどから、クラス名はもっｔシンプルにする方向で検討。

ボタンのときの
.gradient や .icon__arrow 、.border__clr1 のようにシンプルを土台にするが、必要あれば用途がわかるようにbem準拠にする


.c-gutter > initial
.c-gutter__row → row
.c-gutter__sm--left → sm-left
.c-gutter__md--right → md-right

下2つはbem準拠ではないが運用上どうか？、button.module.scss、type.module.scss 、.claude/tmp/_done/typography-bem-analysis.md を踏まえて考慮してほしい。



内部クラスのBEM準拠にて、修正対象のコンポーネント、ページがあれば合わせて修正。


**モジュール化前のファイルについて**
src/srtles/globa/component/ に同内容のファイル（モジュール化する前の元ファイル）があるが、これは最後に整合性チェックするために保管しており、そのことも把握しているので不問として。