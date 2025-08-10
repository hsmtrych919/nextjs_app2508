src/components/layout/footer.tsx を他のプロジェクトで作成したものを移植した。適宜改修して利用できるようにしてほしい。
依存するグローバルクラス(_footer-modal.scss)、モジュールクラス(footer-modal.module.scss)のファイルは移行済だが、中身は以前のまま。

LocationSelectModal.tsx は ModalFooter.tsx とリネームしたうえで、関数名など揃えて利用して。
クラス名 も "locationselect-modal" を "footer-modal" など修正の文脈に合わせて編集して。

まずは関連するファイルと記載内容を確認し、実装計画を立てて。