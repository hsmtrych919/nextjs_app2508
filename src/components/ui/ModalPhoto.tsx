import React, { useState, useCallback } from 'react';
import ReactModal from 'react-modal';
import styles from '@/styles/modules/modal-photo.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';
import { PhotoImage } from '@/lib/constants/photoModal';
import { LazyImgPath, useImagePreloader } from '@/lib/utils/rewritePath';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// const { publicRuntimeConfig } = getConfig(); // LazyImgPathに移行のため不要
// const basePath = (publicRuntimeConfig && publicRuntimeConfig.basePath) || ''; // LazyImgPathに移行のため不要

interface ModalPhotoProps {
  isOpen: boolean;
  onClose: () => void;
  images: PhotoImage[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

/**
 * ModalPhoto: 写真拡大表示用モーダルコンポーネント
 *
 * react-modalを使用した写真専用のモーダル表示コンポーネントです。
 * スワイプナビゲーションとドットインジケーターを備えたスマートフォン特化の設計です。
 *
 * @param isOpen モーダルの表示状態
 * @param onClose モーダルを閉じる関数
 * @param images 表示する画像配列
 * @param currentIndex 現在表示中の画像インデックス
 * @param onNavigate 画像切り替えコールバック関数
 */
const ModalPhoto: React.FC<ModalPhotoProps> = ({ isOpen, onClose, images, currentIndex, onNavigate }) => {
  const currentImage = images[currentIndex];
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // プリロード機能
  useImagePreloader(images, currentIndex);

  if (!currentImage) {
    return null;
  }

  // スワイプ検知の最小距離
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    // 基本的な検証
    if (!images || images.length === 0 || !onNavigate) {
      console.warn('Invalid navigation state');
      return;
    }

    // 現在のインデックスの検証
    if (currentIndex < 0 || currentIndex >= images.length) {
      console.warn('Current index out of bounds:', currentIndex);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      // 左スワイプ: 次の画像
      onNavigate(currentIndex + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      // 右スワイプ: 前の画像
      onNavigate(currentIndex - 1);
    }

    // タッチ状態をクリア
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, images, currentIndex, onNavigate, minSwipeDistance]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      contentLabel="Photo Modal"
      overlayClassName={{
        base: 'modal-photo__overlay',
        afterOpen: 'modal-photo__overlay--after-open',
        beforeClose: 'modal-photo__overlay--before-close',
      }}
      className="modal-photo__content"
      bodyOpenClassName="modal-photo__body--open"
    >
      <div
        className={styles['modal--container']}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles['image--container']}>

          <LazyImgPath
            src={currentImage.full}
            alt={currentImage.alt}
            className={styles['modal--image']}
            context="modal"
          />
        {/* ドットインジケーター */}
        <div className={styles['dot--indicators']}>
          {images.map((_, index) => (
            <span
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles['dot--active'] : ''}`}
            />
          ))}
        </div>

            </div>


        {/* ナビゲーション機能 */}
        <div className={`${gridStyles['row--container']} ${gutterStyles.container} ${styles['navigation--container']}`}>
          <div className={styles['navigation--columns']} >
            <button
              className={styles['prev--button']}
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              type="button"
            >
              <ChevronLeftIcon className={styles['nav--icon']} />
              前へ
            </button>
          </div>
          <div className={styles['navigation--columns']} >
            <button
              className={styles['nav-close--button']}
              onClick={onClose}
              type="button"
            >
              閉じる
            </button>
          </div>
          <div className={styles['navigation--columns']} >
            <button
              className={styles['next--button']}
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === images.length - 1}
              type="button"
            >
              次へ
              <ChevronRightIcon className={styles['nav--icon']} />
            </button>
          </div>
        </div>


      </div>
    </ReactModal>
  );
};

export default ModalPhoto;