import React from 'react';
import { useAppStore } from '@/lib/utils/appStore';
import styles from '@/styles/modules/type.module.scss';

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
      <div className="formation-usage">
        <span className={`${styles['text--medium']} formation-text`}>
          フォーメーション未選択
        </span>

        <style jsx>{`
          .formation-usage {
            padding: 12px 16px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            display: inline-block;
            min-width: 200px;
          }

          .formation-text {
            color: #64748b;
            font-weight: 500;
          }

          /* モバイル対応 */
          @media (max-width: 768px) {
            .formation-usage {
              padding: 10px 14px;
              min-width: 180px;
            }
          }
        `}</style>
      </div>
    );
  }

  // 使用率を取得
  const usagePercentage = getFormationUsagePercentage(selectedFormation.id);

  // 表示テキストの構築
  const formationText = `${selectedFormation.name}: ${usagePercentage}%`;

  return (
    <div className="formation-usage">
      <span className={`${styles['text--medium']} formation-text`}>
        {formationText}
      </span>

      <style jsx>{`
        .formation-usage {
          padding: 12px 16px;
          background-color: #eff6ff;
          border-radius: 8px;
          border: 1px solid #bfdbfe;
          display: inline-block;
          min-width: 200px;
        }

        .formation-text {
          color: #1e40af;
          font-weight: 600;
        }

        /* ホバーエフェクト */
        .formation-usage:hover {
          background-color: #dbeafe;
          border-color: #93c5fd;
          transition: all 0.2s ease;
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .formation-usage {
            padding: 10px 14px;
            min-width: 180px;
          }
          
          .formation-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}