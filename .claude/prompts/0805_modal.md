pages/snippet.tsx の モーダルデモ: ギャラリー 部分のhtml に写真用のモーダルを実装したい。
他のプロジェクトで作成したものだが、 src/components/ui/PhotoModal.tsx を改修して利用してほしい。
依存するグローバルクラス(_photo-modal.scss)、モジュールクラス(photo-modal.module.scss)のファイルは移行済

src/components/ui/PhotoModal.tsx では galleryData をつかていたが、それは廃止。
3つのplaceholder-thumbnail-square.png に対して それぞれ placeholder-landscape.png をモーダル表示。
各画像は差し替えを想定して。

写真のグリッドには以下を参照して。画像はjsonではなく、ファイル内に配列用意して（とりあえず、同じダミー画像の繰り返しでいいが、あとから編集できるように。）


import React from 'react';
import gridStyles from '@/styles/modules/grid.module.scss';
import galleryStyles from '@/styles/modules/gallery.module.scss';
import { ImgPath } from '@/lib/utils/rewritePath';
import { GalleryImage, CategoryKey } from '@/lib/utils/galleryData';

interface PhotoGridProps {
  images: GalleryImage[];
  category: CategoryKey;
  onPhotoClick: (image: GalleryImage, index: number) => void;
  hasOpenedModal: boolean;
}

/**
 * PhotoGrid: 写真グリッド表示コンポーネント
 *
 * gridDemo.tsxのgrid--2パターンを活用した2列グリッドレイアウトで
 * ギャラリー写真のサムネイルを表示します。
 *
 * @param images - 表示する画像配列
 * @param category - 現在のカテゴリ（デバッグ用）
 * @param onPhotoClick - 写真クリック時のコールバック関数
 */
const PhotoGrid: React.FC<PhotoGridProps> = ({ images, category, onPhotoClick, hasOpenedModal }) => {
  return (
    <>
      <ul className={`${gridStyles.grid} ${gridStyles['grid--2']}  ${gridStyles['grid--sm-4']} ${galleryStyles['grid--container--list']}`} >
        {images.map((image, index) => (
          <li key={`${category}-${index}`}>
            <button
              onClick={() => onPhotoClick(image, index)}
              className={galleryStyles['photo-grid--button']}
            >
              <ImgPath
                src={image.thumbnail}
                alt={image.alt}
                className={galleryStyles['photo-grid--image']}
              />
              {index === 0 && !hasOpenedModal && (
                <span className={galleryStyles['guide--overlay']}>
                  タップして拡大
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default PhotoGrid;

まずは各要素、コードと要点を整理して、再利用するもの本件に合わせて編集するものの計画を立てること。