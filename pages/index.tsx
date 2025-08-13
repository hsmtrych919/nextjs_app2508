import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import BudgetManager from '@/components/ui/BudgetManager';
import FormationSelector from '@/components/ui/FormationSelector';
import StockInput from '@/components/ui/StockInput';
import {
  useAppStore,
  useLoadDataFromAPI
} from '@/lib/utils/appStore';
import { FORMATION_DEFINITIONS } from '@/lib/constants/types';
import styles from '@/styles/modules/index.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';// ファイル下に meta情報用の getStaticProps記載

export default function SatelliteInvestmentApp() {
  const {
    selectedFormation,
    tiers,
    budget,
    formationUsage,
    isLoading,
    error,
    updateBudget
  } = useAppStore();

  // 初期データ読み込み（バックグラウンド処理）
  const loadDataFromAPI = useLoadDataFromAPI();

  // ローカル状態
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期データ読み込み（バックグラウンド処理）
  useEffect(() => {
    if (!isInitialized) {
      loadDataFromAPI().finally(() => {
        setIsInitialized(true);
      });
    }
  }, [loadDataFromAPI, isInitialized]);

  return (
    <Layout>
      <main className={styles.satelliteApp}>

        {/* ヘッダーセクション */}
        <section className={`${styles.header}`}>
          <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
            <div className={`${gridStyles['col--12']}`}>
              <h1 className={styles.title}>サテライト投資管理</h1>
              <p className={styles.subtitle}>6000ドル運用システム</p>
            </div>
          </div>
        </section>

        {/* フォーメーション選択セクション（位置変更：上部に移動） */}
        <section className={`${styles.formationSection}`}>
          <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
            <div className={`${gridStyles['col--12']}`}>
              <div style={{ padding: '1rem 0' }}>
                <FormationSelector />
              </div>
            </div>
          </div>
        </section>

        {/* Tier別銘柄入力セクション */}
        {selectedFormation && (
          <section className={`${styles.stockInputSection}`}>
            <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
              <div className={`${gridStyles['col--12']}`}>
                <StockInput />
              </div>
            </div>
          </section>
        )}

        {/* 予算管理セクション */}
        <section className={`${styles.budgetManagerSection}`}>
          <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
            <div className={`${gridStyles['col--12']}`}>
              <BudgetManager />
            </div>
          </div>
        </section>

        {/* フォーメーション使用統計 - 常に表示 */}
        <section className={`${styles.statsSection}`}>
          <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
            <div className={`${gridStyles['col--12']}`}>
              <div className={styles.statsCard}>
                <h2>フォーメーション使用統計</h2>
                <div className={styles.statsList}>
                  {FORMATION_DEFINITIONS.map((formation) => {
                    const usage = formationUsage.find(u => u.formationId === formation.id);
                    return (
                      <div key={formation.id} className={styles.statItem}>
                        <span>{formation.name}</span>
                        <span>{usage?.usagePercentage || 0}%</span>
                        <span>使用回数: {usage?.usageCount || 0}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* エラー表示 */}
        {error && (
          <section className={`${styles.errorSection}`}>
            <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
              <div className={`${gridStyles['col--12']}`}>
                <div className={styles.errorCard}>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <section className={`${styles.loadingSection}`}>
            <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
              <div className={`${gridStyles['col--12']}`}>
                <div className={styles.loadingCard}>
                  <p>
                    {!isInitialized ? 'アプリを初期化中...' : 'データを処理中...'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 初期化中のオーバーレイ */}
        {!isInitialized && (
          <section className={`${styles.initializingSection}`}>
            <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
              <div className={`${gridStyles['col--12']}`}>
                <div className={styles.initializingCard}>
                  <h2>データ読み込み中</h2>
                  <p>サーバーからデータを取得しています...</p>
                  {isLoading && <div className={styles.spinner}></div>}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  const pageMeta = {
    description: 'サテライト投資管理アプリ - 6000ドル運用システム',
  };
  return {
    props: {
      pageMeta,
    },
  };
}
