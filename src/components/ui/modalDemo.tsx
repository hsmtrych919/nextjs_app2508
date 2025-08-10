import React, { useState, ReactNode } from 'react';
import ReactModal from 'react-modal';
import styles from '@/styles/modules/button.module.scss';

interface ModalProps {
  children?: ReactNode;
}

/**
 * ModalDemo: モーダル表示機能付きデモコンポーネント
 *
 * ボタンクリックでモーダルを開き、カスタムコンテンツまたはデフォルトコンテンツを表示します。
 * react-modalライブラリを使用した基本的なモーダル実装のデモンストレーション用です。
 *
 * - ボタンクリックでモーダル開閉
 * - ESCキーとオーバーレイクリックで閉じる
 * - カスタムchildren対応
 * - デフォルトコンテンツ提供
 * - 統一されたスタイルクラス適用
 *
 * @param children モーダル内に表示するカスタムコンテンツ（省略時はデフォルトコンテンツを表示）
 *
 * @example
 * // 基本的な使用例（デフォルトコンテンツ）
 * <ModalDemo />
 *
 * @example
 * // カスタムコンテンツを指定
 * <ModalDemo>
 *   <h2>カスタムタイトル</h2>
 *   <p>カスタムコンテンツです</p>
 * </ModalDemo>
 *
 * @remarks
 * - react-modalライブラリが必要です
 * - button.module.scssスタイルを使用
 * - CSSクラス「reactmodal__overlay」「reactmodal__item--container」などを使用
 * - アクセシビリティ対応（contentLabel設定）
 */
export default function ModalDemo({ children }: ModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button onClick={openModal} className={styles.sample}>
        モーダル展開
      </button>

      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
        contentLabel="Demo Modal"
        overlayClassName={{
          base: 'reactmodal__overlay',
          afterOpen: 'reactmodal__overlay--after-open',
          beforeClose: 'reactmodal__overlay--before-close',
        }}
        className="reactmodal__item--container"
        bodyOpenClassName="reactmodal__body--open"
      >
        {children || (
          <div>
            <h2>モーダルタイトル</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          </div>
        )}
        <button onClick={closeModal} className='reactmodal__items--close'>閉じる</button>
      </ReactModal>
    </div>
  );
}

