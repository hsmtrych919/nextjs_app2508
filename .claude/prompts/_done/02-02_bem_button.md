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

### button.module.scss

#### 1. .button クラス
現状では 統合前に存在していた .button と、統合された .c-buttonおよび .c-buttonから始まるクラスが存在。

まずは統合前の .button クラスを .sample と名前変更して使用されているコンポーネントやページがあれば合わせて修正。

#### 2. ミックスイン @mixin c-button の修正
コンポーネントであること示す c- の役割なくなったので、@mixin button に修正

#### 3. 内部クラスのBEM準拠
モジュール化したことで、ファイル内のクラスはボタンであること確定していること、出力には内部クラスは モジュール名からの 'button' が付属されることなどから、クラス名はもっｔシンプルにする方向で検討。

使用例は以下の構成
```tsx
    <LinkPath link={linkPath} as={linkPath} className={`${styles['c-button']} ${styles['c-button__grd']}`}>
      ボタンテキスト こちらへ
      <ChevronRightIcon className={styles['c-button__icon--arrow']} />
    </LinkPath>
```

提案。bem準拠していないものあれば指摘して候補出し。
.c-button > component
.c-button__icon--arrow > icon__arrow
.c-button__icon--external > icon__external
.c-button__icon--tel > icon__tel
.c-button__grd > grd
.c-button__clr1 （コメントアウト） > clr1
.c-button__tel > tel
.c-button__clr1--border > border__clr1
.ignore そのまま

内部クラスのBEM準拠にて、修正対象のコンポーネント、ページがあれば合わせて修正。


**モジュール化前のファイルについて**
src/srtles/globa/component/ に同内容のファイル（モジュール化する前の元ファイル）があるが、これは最後に整合性チェックするために保管しており、そのことも把握しているので不問として。