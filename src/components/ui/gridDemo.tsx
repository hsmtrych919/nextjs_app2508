import React from 'react';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';

/**
 * GridDemo: グリッドシステムデモコンポーネント
 *
 * CSS Modulesに移行されたグリッドクラスを使用したレスポンシブレイアウトシステムのデモです。
 * フレーミング・余白・コンテンツの3層構造によるクリーンなレイアウト設計を実演します。
 *
 * ## 基本構造パターン
 *
 * ### パターン1: 標準カラムレイアウト
 * ```jsx
 * <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
 *   <div className={`${gridStyles['col--12']} ${gridStyles['col--lg-8']}`}>
 *     <div style={{...}}>コンテンツ</div>  // 3層目: コンテンツ
 *   </div>                                 // 2層目: カラム幅定義
 * </div>                                   // 1層目: コンテナ・余白
 * ```
 *
 * ### パターン2: ブロックグリッドレイアウト
 * ```jsx
 * <ul className={`${gridStyles['grid']} ${gridStyles['grid--2']} ${gridStyles['grid--md-4']}`}>
 *   <li>
 *     <div style={{...}}>コンテンツ</div>  // 3層目: コンテンツ
 *   </li>                                // 2層目: グリッドアイテム
 * </ul>                                  // 1層目: グリッドコンテナ
 * ```
 *
 * ## 設計思想
 * - **1層目**: フレーミング（.row--container, .grid）と余白システム（.container, .small--left等）
 * - **2層目**: カラム幅定義（.col--*, .col--*-*）またはグリッドアイテム（li, .col）
 * - **3層目**: 実際のコンテンツ（背景色、パディング、テキストなど）
 *
 * ## 重要なポイント
 * - グリッド構造とコンテンツを分離することで保守性向上
 * - 余白システムは1層目で制御、2層目では幅のみ定義
 * - 背景色・装飾は必ず3層目で実装（構造の混在を防ぐ）
 * - レスポンシブ対応は2層目のクラスで制御
 *
 * ## 主要クラス
 * - `.row--container`: レスポンシブコンテナ
 * - `.col--{n}`: nカラム幅指定
 * - `.col--{breakpoint}-{n}`: ブレークポイント別幅指定
 * - `.grid .grid--{n}`: nカラムのブロックグリッド
 * - `.container`: 基本行レイアウト、`.small--left`等: 余白制御クラス
 *
 * @example
 * // 基本的な2カラムレイアウト
 * <div className="row--container container">
 *   <div className="col--12 col--lg-8">
 *     <article>メインコンテンツ</article>
 *   </div>
 *   <div className="col--12 col--lg-4">
 *     <aside>サイドバー</aside>
 *   </div>
 * </div>
 *
 * @example
 * // カードグリッドレイアウト
 * <ul className="grid grid--1 grid--sm-2 grid--lg-3">
 *   <li><div className="card">カード1</div></li>
 *   <li><div className="card">カード2</div></li>
 *   <li><div className="card">カード3</div></li>
 * </ul>
 *
 * @remarks
 * - CSS変数（--gutter, --gutter-row）による余白制御
 * - モバイルファースト設計
 * - フレックスボックスベースの実装
 */
const GridDemo: React.FC = () => {
  return (
    <div>
      <h2>Grid System Demo</h2>

      {/* Container デモ */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Container System</h3>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container}`} >
          <div className={gridStyles['col--12']} style={{ background: '#ddd', padding: '0.5rem' }}>
            .row--container - レスポンシブコンテナ（CSS Modules版）
          </div>
        </div>
      </section>


      {/* Responsive Columns デモ */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Responsive Columns</h3>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
          <div className={`${gridStyles['col--12']} ${gridStyles['col--sm-6']} ${gridStyles['col--lg-4']}`} >
            <div style={{ background: '#ffe6f3', padding: '0.5rem' }}>
              .col--12 .col--sm-6 .col--lg-4（CSS Modules版）
              <br />
              <small>Mobile: 12/12, Tablet: 6/12, Desktop: 4/12</small>
            </div>
          </div>
          <div className={`${gridStyles['col--12']} ${gridStyles['col--sm-6']} ${gridStyles['col--lg-4']}`} >
            <div style={{ background: '#f3e6ff', padding: '0.5rem' }}>
              .col--12 .col--sm-6 .col--lg-4（CSS Modules版）
              <br />
              <small>Mobile: 12/12, Tablet: 6/12, Desktop: 4/12</small>
            </div>
          </div>
          <div className={`${gridStyles['col--12']} ${gridStyles['col--sm-12']} ${gridStyles['col--lg-4']}`} >
            <div style={{ background: '#e6f3ff', padding: '0.5rem' }}>
              .col--12 .col--sm-12 .col--lg-4（CSS Modules版）
              <br />
              <small>Mobile: 12/12, Tablet: 12/12, Desktop: 4/12</small>
            </div>
          </div>
        </div>
      </section>

      {/* Mixed Layout デモ */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Mixed Layout Example</h3>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
          <div className={`${gridStyles['col--12']} ${gridStyles['col--lg-8']} ${gutterStyles['medium--right']}`} >
            <div style={{ background: '#e8f5e8', height: '100%' }}>
              <h4>Main Content Area（CSS Modules版）</h4>
              <p>メインコンテンツエリア。デスクトップでは8/12の幅、モバイルでは全幅で表示されます。</p>
            </div>
          </div>
          <div className={`${gridStyles['col--12']} ${gridStyles['col--lg-4']}`} >
            <div style={{ background: '#e3f2fd' }}>
              <h4>Sidebar（CSS Modules版）</h4>
              <p>サイドバーエリア。デスクトップでは4/12の幅、モバイルでは全幅で表示されます。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Auto Columns デモ */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Auto Columns</h3>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
          <div className={gridStyles.col} >
            <div style={{ background: '#ffe6e6', height: '100%' }}>.col 自動幅（CSS Modules版）</div>
          </div>
          <div className={`${gridStyles['col--5']} ${gutterStyles['small--left']}`} >
            <div style={{ background: '#e6ffe6', height: '100%' }}>.col--5 Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum excepturi corporis nostrum assumenda suscipit accusamus velit cumque atque facilis nesciunt quis aspernatur, quam id quos. Eos eaque saepe dolor repellendus.</div>
          </div>
          <div className={gridStyles.col} >
            <div style={{ background: '#e6e6ff', height: '100%' }}>.col 自動幅 Lorem ipsum dolor sit amet（CSS Modules版）</div>
          </div>
        </div>
      </section>


      {/* Responsive Block Grid デモ */}
      <section style={{ marginBottom: '2rem' }}>
        <h3>Responsive Block Grid</h3>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
  <div className={gridStyles['col--12']} >
        <ul className={`${gridStyles.grid} ${gridStyles['grid--2']} ${gridStyles['grid--md-4']}`} style={{ rowGap: 'var(--gutter)' }}>
          <li >
            <p style={{ background: '#fff3e0', padding: '0.5rem' }}>Item A</p>
          </li>
          <li >
            <p style={{ background: '#f3e5f5', padding: '0.5rem' }}>Item B</p>
          </li>
          <li >
            <p style={{ background: '#e0f2f1', padding: '0.5rem' }}>Item C</p>
          </li>
          <li >
            <p style={{ background: '#fce4ec', padding: '0.5rem' }}>Item D</p>
          </li>
          <li >
            <p style={{ background: '#e8f5e8', padding: '0.5rem' }}>Item E</p>
          </li>
          <li >
            <p style={{ background: '#e3f2fd', padding: '0.5rem' }}>Item F</p>
          </li>
        </ul>
        <p><small>.grid--2 .grid--md-4 - Mobile: 2列, Desktop: 4列</small></p>
        </div>
        </div>
      </section>


    </div>
  );
};

export default GridDemo;
