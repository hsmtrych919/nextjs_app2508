import React from 'react';
import {
  useSelectedFormation,
  useFormationUsage
} from '@/lib/utils/appStore';
import styles from '@/styles/modules/index.module.scss';
import typeStyles from '@/styles/modules/type.module.scss';

/**
 * FormationUsageコンポーネント (Phase 3.3 最適化版)
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
  const selectedFormation = useSelectedFormation();
  const formationUsage = useFormationUsage();

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

  // Phase 3.3: 使用率を直接計算
  const usage = formationUsage.find((u: any) => u.formationId === selectedFormation.id);
  const usagePercentage = usage?.usagePercentage || 0;

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