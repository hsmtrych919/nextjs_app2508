まず現状でロールバック用のコミット作成（作る必要なくても強制実行）
そして
gutter.module.scss のクラス名準拠に取り掛かる。

まずはgutter.module.scssの現状クラスでの使用箇所をリストアップ。

その後、現在の方針に合わせてgutter.module.scss のクラス名更新を実行。

.c-gutter                    → .container--initial
.c-gutter__row               → .container （一番使うのでmodifierなし）
.c-gutter__sm--left          → .small--left
.c-gutter__sm--left-half     → .small--left-half
.c-gutter__md--right     → .medium--right
ほかのクラスも同様に更新。不明なものあれば適宜確認。

クラスメ名の変更後、使用箇所のアップデートを実行。
一通り変更できたらビルドとdevのチェック。一通りの作業内容を報告書にまとめて出力して完了。ok?

