import React from 'react';
import { FORMATION_DEFINITIONS } from '@/lib/constants/types';
import { useAppStore } from '@/lib/utils/appStore';
import styles from '@/styles/modules/index.module.scss';

/**
 * FormationSelectorコンポーネント
 *
 * シンプルなボタン形式のフォーメーション選択コンポーネント
 * 選択により下部のTier数が動的に変更される
 */
export default function FormationSelector() {
  const selectedFormation = useAppStore(state => state.selectedFormation);
  const setSelectedFormation = useAppStore(state => state.setSelectedFormation);

  const handleFormationSelect = (formationId: string) => {
    const formation = FORMATION_DEFINITIONS.find(f => f.id === formationId);
    if (formation) {
      setSelectedFormation(formation);
    }
  };

  return (
    <div className={styles.formationSelectorWrap}>
      <h2 className={styles.formationSelectorTitle}>フォーメーション選択</h2>
      <p className={styles.formationSelectorDescription}>
        投資戦略のフォーメーションを選択してください。
      </p>

      <div className={styles.formationSelectorButtonList}>
        {FORMATION_DEFINITIONS.map((formation) => (
          <button
            key={formation.id}
            onClick={() => handleFormationSelect(formation.id)}
            className={`${styles.formationSelectorButton} ${
              selectedFormation?.id === formation.id ? styles['formationSelectorButton--active'] : ''
            }`}
          >
            {formation.name}
          </button>
        ))}
      </div>
    </div>
  );
}