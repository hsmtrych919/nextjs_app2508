import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import {
  useAppStore,
  useLoadDataFromAPI,
  useSaveDataToAPI,
  useSaveBudgetToAPI,
  useSaveFormationToAPI,
  useAutoSaveEnabled,
  useEnableAutoSave,
  useDisableAutoSave
} from '@/lib/utils/appStore';
import { FORMATION_DEFINITIONS } from '@/lib/constants/types';
import styles from '@/styles/modules/index.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';

// ファイル下に meta情報用の getStaticProps記載

export default function SatelliteInvestmentApp() {
  const {
    selectedFormation,
    tiers,
    budget,
    formationUsage,
    isLoading,
    error,
    setSelectedFormation,
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

  const handleFormationSelect = async (formationId: string) => {
    const formation = FORMATION_DEFINITIONS.find(f => f.id === formationId);
    if (formation) {
      setSelectedFormation(formation);
    }
  };

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
              <div className={styles.formationCard}>
                <h2>フォーメーション選択</h2>
                <div className={styles.formationButtons}>
                  {FORMATION_DEFINITIONS.map((formation) => (
                    <button
                      key={formation.id}
                      onClick={() => handleFormationSelect(formation.id)}
                      className={`${styles.formationButton} ${
                        selectedFormation?.id === formation.id ? styles.active : ''
                      }`}
                    >
                      {formation.name}
                    </button>
                  ))}
                </div>

                {selectedFormation && (
                  <div className={styles.selectedFormation}>
                    <h3>選択中: {selectedFormation.name}</h3>
                    <div className={styles.tierInfo}>
                      {selectedFormation.percentages.map((percentage, index) => (
                        <div key={index} className={styles.tierItem}>
                          <span>Tier {index + 1}</span>
                          <span>{percentage}%</span>
                          <span>${((budget.funds * percentage) / 100).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* フォーメーション使用統計 */}
        {formationUsage.length > 0 && (
          <section className={`${styles.statsSection}`}>
            <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
              <div className={`${gridStyles['col--12']}`}>
                <div className={styles.statsCard}>
                  <h2>フォーメーション使用統計</h2>
                  <div className={styles.statsList}>
                    {formationUsage.map((usage) => {
                      const formation = FORMATION_DEFINITIONS.find(f => f.id === usage.formationId);
                      return (
                        <div key={usage.formationId} className={styles.statItem}>
                          <span>{formation?.name || usage.formationId}</span>
                          <span>{usage.usagePercentage}%</span>
                          <span>使用回数: {usage.usageCount}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

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
