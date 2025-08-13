import React from 'react';
import { useAppStore } from '@/lib/utils/appStore';
import styles from '@/styles/modules/index.module.scss';
import typeStyles from '@/styles/modules/type.module.scss';

/**
 * FormationUsageコンポーネント
 *
 * 選択中のフォーメーションとその使用率をシンプルなテキスト形式で表示します。
 * 「3銘柄 50-30-20%型: XX%」の形式で表示されます。
 *
 * 主な機能:
 * - 選択中フォーメーションの表示
 * - フォーメーション使用率の表示
 * - フォーメーション未選択時の適切な表示
 *
 * @example
 * ```tsx
 * <FormationUsage />
 * ```
 *
 * @returns FormationUsageコンポーネント
 */
export default function FormationUsage() {
  const { selectedFormation, getFormationUsagePercentage } = useAppStore(state => ({
    selectedFormation: state.selectedFormation,
    getFormationUsagePercentage: state.getFormationUsagePercentage
  }));

  // フォーメーション未選択時の表示
  if (!selectedFormation) {
    return (
      <div className={styles['usage--empty']}>
        <span className={`${typeStyles['text--medium']} ${styles['text--empty']}`}>
          フォーメーション未選択
        </span>
      </div>
    );
  }

  // 使用率を取得
  const usagePercentage = getFormationUsagePercentage(selectedFormation.id);

  // 表示テキストの構築
  const formationText = `${selectedFormation.name}: ${usagePercentage}%`;

  return (
    <div className={styles['usage--selected']}>
      <span className={`${typeStyles['text--medium']} ${styles['text--selected']}`}>
        {formationText}
      </span>
    </div>
  );
}