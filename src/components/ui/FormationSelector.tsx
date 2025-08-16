import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { FORMATION_DEFINITIONS } from '@/lib/constants/types';
import {
  useSelectedFormation,
  useSelectFormation
} from '@/lib/utils/appStore';
import styles from '@/styles/modules/index.module.scss';

/**
 * FormationSelectorコンポーネント (Phase 3.3 最適化版)
 *
 * Radix UI Selectを使用したフォーメーション選択コンポーネント
 * 5つのフォーメーション選択肢を提供し、選択時にZustandストア更新
 * 下部Tier数の動的変更に対応
 */
export default function FormationSelector() {
  const selectedFormation = useSelectedFormation();
  const selectFormation = useSelectFormation();

  const handleFormationSelect = (formationId: string) => {
    const formation = FORMATION_DEFINITIONS.find((f: any) => f.id === formationId);
    if (formation) {
      selectFormation(formation);
    }
  };

  return (
    <div className={styles['formation-selector--wrap']}>
      <h2 className={styles['formation-selector--title']}>フォーメーション選択</h2>
      <p className={styles['formation-selector--description']}>
        投資戦略に応じてフォーメーションを選択してください。各フォーメーションは異なる資金配分比率を持ちます。
      </p>

      {/* Radix UI Select */}
      <Select.Root value={selectedFormation?.id || ''} onValueChange={handleFormationSelect}>
        <Select.Trigger className={styles['formation-select--trigger']}>
          <Select.Value placeholder="フォーメーションを選択" />
          <Select.Icon className={styles['formation-select--icon']}>
            <ChevronDown />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className={styles['formation-select--content']}>
            <Select.Viewport className={styles['formation-select--viewport']}>
              {FORMATION_DEFINITIONS.map((formation) => (
                <Select.Item
                  key={formation.id}
                  value={formation.id}
                  className={styles['formation-select--item']}
                >
                  <Select.ItemIndicator className={styles['formation-select--indicator']}>
                    ✓
                  </Select.ItemIndicator>
                  <Select.ItemText>
                    {formation.name} ({formation.percentages.join(', ')}%)
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}