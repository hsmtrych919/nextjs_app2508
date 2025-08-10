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

### typography.module.scss

現状では c-　および、c-ttlとc-typが B（ブロック）の役割かつ記載ファイルの場所を明確にいしていたが、モジュール化により役割なくなった。
単純に考えると
.c-ttl__xsmall 類は
.ttl__xsmall

.c-typ 類は
.typ、.typ__xs

となるが、これはbem準拠してる？


**モジュール化前のファイルについて**
src/srtles/globa/component/ に同内容のファイル（モジュール化する前の元ファイル）があるが、これは最後に整合性チェックするために保管しており、そのことも把握しているので不問として。