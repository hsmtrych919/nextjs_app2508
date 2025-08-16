import { } from 'react';
import Layout from '@/components/layout/layout';
import BudgetManager from '@/components/ui/BudgetManager';
import FormationSelector from '@/components/ui/FormationSelector';
import StockInput from '@/components/ui/StockInput';
import {
  useSelectedFormation,
  useTiers,
  useBudget,
  useFormationUsage
} from '@/lib/utils/appStore';
import { FORMATION_DEFINITIONS } from '@/lib/constants/types';
import styles from '@/styles/modules/index.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';

export default function SatelliteInvestmentApp() {
  // Phase 3.3: 最適化されたhookを使用
  const selectedFormation = useSelectedFormation();
  const tiers = useTiers();
  const budget = useBudget();
  const formationUsage = useFormationUsage();

  // Phase 3.3: 自動保存は背景で実行されるため、手動読み込みは不要

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

        {/* 1. フォーメーション選択（FormationSelector） */}
        <section className={`${styles['formation--section']}`}>
          <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
            <div className={`${gridStyles['col--12']}`}>
              <FormationSelector />
            </div>
          </div>
        </section>

        {/* 2. Tier別銘柄入力セクション（StockInput - 動的表示） */}
        {selectedFormation && (
          <StockInput />
        )}

        {/* 3. 予算管理エリア（BudgetManager - 入力可能） */}
        <BudgetManager />

        {/* 4. Formation Usage表示（シンプルテキスト） */}
        <section className={`${styles['stats--section']}`}>
          <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
            <div className={`${gridStyles['col--12']}`}>
              <div className={styles['stats--card']}>
                <h2>フォーメーション使用統計</h2>
                <div className={styles['stats--list']}>
                  {FORMATION_DEFINITIONS.map((formation) => {
                    const usage = formationUsage.find((u: any) => u.formationId === formation.id);
                    return (
                      <div key={formation.id} className={styles['stat--item']}>
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
