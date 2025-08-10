import { useState } from 'react';
import styles from '@/styles/modules/footer.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';
import { PhoneIcon } from '@heroicons/react/24/solid';
import ModalFooter from '@/components/ui/ModalFooter';


export default function Footer() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const currentTime = new Date();
  const year = currentTime.getFullYear();

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  return (
    <>
        {/* ナビゲーション機能 */}
        <div className={`${gridStyles['row--container']} ${gutterStyles.container} ${styles['navigation--container']}`}>
          <div className={styles['navigation--columns']} >
            <a href="#" className={`${styles['navigation--button']}`}>ボタン<br/>テキスト</a>

          </div>
          <div className={styles['navigation--columns']} >
            <button onClick={openLocationModal} className={`${styles['navigation--button-even']}`}>モーダル</button>
          </div>
          <div className={styles['navigation--columns']} >
            <a href="#" className={`${styles['navigation--button']}`}>
              <PhoneIcon className={styles['phone--icon']} />
              テキスト
            </a>
          </div>
        </div>

      <footer className={`${styles.outer}`}>
        {/* <ul className={`${gridStyles['row--container']} ${gutterStyles.container} ${styles.navi_list}`}>
          <li><a className={styles.navi_button} href="#">ダミーテキストです。</a></li>
        </ul> */}
        <p className={`${styles.copy} fz-14 tac` }>&copy; {year} ダミーテキストです。</p>
      </footer>

      {/* 位置選択モーダル */}
      <ModalFooter
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
      />
    </>
  );
}