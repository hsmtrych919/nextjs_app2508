import React from 'react';
import * as Select from '@radix-ui/react-select';
import { FORMATION_DEFINITIONS } from '@/lib/constants/types';
import { useAppStore } from '@/lib/utils/appStore';
import styles from '@/styles/modules/index.module.scss';

/**
 * FormationSelectorコンポーネント
 *
 * Radix UI Selectを使用したフォーメーション選択コンポーネント
 * 5つのフォーメーション選択肢を提供し、選択時にZustandストア更新
 * 下部Tier数の動的変更に対応
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

      <Select.Root
        value={selectedFormation?.id || ''}
        onValueChange={handleFormationSelect}
      >
        <Select.Trigger className={styles.formationSelectTrigger}>
          <Select.Value placeholder="フォーメーションを選択してください" />
          <Select.Icon className={styles.formationSelectIcon}>
            ▼
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className={styles.formationSelectContent}>
            <Select.Viewport className={styles.formationSelectViewport}>
              {FORMATION_DEFINITIONS.map((formation) => (
                <Select.Item
                  key={formation.id}
                  value={formation.id}
                  className={styles.formationSelectItem}
                >
                  <Select.ItemText>{formation.name}</Select.ItemText>
                  <Select.ItemIndicator className={styles.formationSelectIndicator}>
                    ✓
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}