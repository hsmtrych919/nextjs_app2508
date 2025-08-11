import React, { useState } from 'react';
import Layout from '@/components/layout/layout';
import SimpleModalDemo from '@/components/ui/modalDemo';
import SimpleToggleDemo from '@/components/ui/toggleDemo';
import SimpleTabDemo from '@/components/ui/tabDemo';
import SimpleTableDemo from '@/components/ui/tableDemo';
import { ButtonType01, ButtonType02 } from '@/components/ui/buttonDemo';
import GridDemo from '@/components/ui/gridDemo';
import VideoPlayer from '@/components/ui/VideoPlayer';
import GridPhoto from '@/components/ui/GridPhoto';
import ModalPhoto from '@/components/ui/ModalPhoto';
import { useInView } from '@/lib/hooks/useInView';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';
import { ImgPath } from '@/lib/utils/rewritePath';
import { PhotoImage, demoImages } from '@/lib/constants/photoModal';

// ファイル下に meta情報用の getStaticProps記載

export default function PageDemo() {
  // フォトモーダルの状態管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasOpenedModal, setHasOpenedModal] = useState(false);

  // useInViewを実行（`.inview__fadein`クラスを持つ要素を監視）
  useInView();

  // フォトグリッドクリック時の処理
  const handlePhotoClick = (_: PhotoImage, index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
    setHasOpenedModal(true);
  };

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // モーダル内ナビゲーション
  const handleNavigate = (index: number) => {
    if (index >= 0 && index < demoImages.length) {
      setCurrentImageIndex(index);
    }
  };

  return (
    <Layout>
      <article className="mt-12">

        {/* グリッドデモ */}
        <section style={{ marginBottom: '40px' }}>
          <h2>グリッドデモ</h2>
          <p>_grid.scss のグローバルクラスを使用したレイアウトシステムのデモ</p>
          <GridDemo />
        </section>

        {/* img&video */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>img&video</h3>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
  <div className={`${gridStyles['col--12']}  ${gridStyles['col--md-10']}`}>
        <ul className={`${gridStyles.grid} ${gridStyles['grid--2']} ${gridStyles['grid--md-4']}`} style={{ rowGap: 'calc(var(--gutter) * 2)' }}>
          <li >
              <ImgPath
                src={'placeholder-thumbnail-square.png'}
                alt={"Placeholder Image"}
              />
          </li>
          <li >
            <ImgPath
              src={'placeholder-thumbnail-square.png'}
              alt={"Placeholder Image"}
            />
          </li>
          <li >
            <ImgPath
              src={'placeholder-thumbnail-square.png'}
              alt={"Placeholder Image"}
            />
          </li>
        </ul>
        </div>
        </div>
    <div className={`${gridStyles['row--container']} ${gutterStyles.container} mt-3`}>
      <div className={`${gridStyles['col--12']} ${gridStyles['col--md-10']}`}>
        <VideoPlayer
          videoSrc="video.mp4"
          posterSrc="video-thumbnail.png"
          aspectRatio="16by9"
        />
      </div>
    </div>
      </section>

        {/* ボタンデモ */}
        <section style={{ marginBottom: '40px' }}>
          <h2>ボタンデモ</h2>
          <p>グローバルSCSSクラス（c-button, c-button__grd, c-button__clr1--border）を使用したボタンサンプル</p>
          <div style={{ width: '360px', margin: '20px auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <ButtonType01 type="primary" />
            <ButtonType02 type="primary" />
          </div>
        </section>

        {/* モーダルデモ */}
        <section style={{ marginBottom: '40px' }}>
          <h2>モーダルデモ</h2>
          <SimpleModalDemo />

        {/* モーダルデモ: ギャラリー */}
        <div className={`${gridStyles['row--container']} ${gutterStyles.container} mt-3`}>
          <div className={`${gridStyles['col--12']} ${gridStyles['col--md-10']}`}>
            <GridPhoto
              images={demoImages}
              onPhotoClick={handlePhotoClick}
              hasOpenedModal={hasOpenedModal}
            />
          </div>
        </div>

        {/* フォトモーダル */}
        <ModalPhoto
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          images={demoImages}
          currentIndex={currentImageIndex}
          onNavigate={handleNavigate}
        />

        </section>

        {/* トグルデモ */}
        <section style={{ marginBottom: '40px' }}>
          <h2>トグルデモ</h2>
          <SimpleToggleDemo />
        </section>

        {/* タブデモ */}
        <section style={{ marginBottom: '40px' }}>
          <h2>タブデモ</h2>
          <SimpleTabDemo />
        </section>

        {/* テーブルデモ */}
        <section style={{ marginBottom: '40px' }}>
          <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
            <div className={`${gridStyles['col--12']} ${gridStyles['col--md-10']} ${gridStyles['col--xl-10']}`}>

          <h2>テーブルデモ</h2>
          <p>横スクロール対応テーブル（scroll-hint + シャドウ機能付き）</p>
          <SimpleTableDemo />
          </div>
          </div>
        </section>

        {/* InViewデモ */}
        <section style={{ marginBottom: '40px' }}>
          <h2>InViewデモ</h2>
          <p>スクロールして下の要素が表示されるときにフェードイン効果が適用されます</p>

          <div style={{ height: '100vh', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>スクロールして下を見てください ↓</p>
          </div>

          <div className="inview__fadein">
            <h3>InView要素1</h3>
            <p>この要素は画面に入るとフェードインします</p>
          </div>

          <div style={{ height: '50vh' }}></div>

          <div className="inview__fadein">
            <h3>InView要素2</h3>
            <p>この要素も画面に入るとフェードインします</p>
          </div>
        </section>

      </article>
    </Layout>
  );
}

export async function getStaticProps() {
  const pageMeta = {
    title: 'snippet page',
    ogUrl: 'demo/',
    description: 'lorem ipsum',
  };
  return {
    props: {
      pageMeta,
    },
  };
}
