import React from 'react';
import styles from '@/styles/modules/photo-modal.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import { ImgPath } from '@/lib/utils/rewritePath';
import { PhotoImage } from '@/lib/constants/photoModal';

interface PhotoGridProps {
  images: PhotoImage[];
  onPhotoClick: (image: PhotoImage, index: number) => void;
  hasOpenedModal: boolean;
}

/**
 * GridPhoto: 写真グリッド表示コンポーネント
 *
 * gridDemo.tsxのgrid--2パターンを活用した2列グリッドレイアウトで
 * ギャラリー写真のサムネイルを表示します。
 *
 * @param images - 表示する画像配列
 * @param onPhotoClick - 写真クリック時のコールバック関数
 * @param hasOpenedModal - モーダルが開かれたことがあるかの状態
 *
 * @example
 * <GridPhoto
 *   images={demoImages}
 *   onPhotoClick={(image, index) => openModal(image, index)}
 *   hasOpenedModal={hasOpenedModal}
 * />
 */
const GridPhoto: React.FC<PhotoGridProps> = ({ images, onPhotoClick, hasOpenedModal }) => {
  return (
    <ul className={`${gridStyles.grid} ${gridStyles['grid--2']} ${gridStyles['grid--md-4']}`} style={{ rowGap: 'var(--gutter)' }}>
      {images.map((image, index) => (
        <li key={index}>
          <button
            onClick={() => onPhotoClick(image, index)}
            className={`${styles['thumbnail--button']}`}
          >
            <ImgPath
              src={image.thumbnail}
              alt={image.alt}
              className={styles['thumbnail--image']}
            />
            {index === 0 && !hasOpenedModal && (
                <span className={`${styles['thumbnail--guide-overlay']}`}>
                タップして拡大
                </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default GridPhoto;