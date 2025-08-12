import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from 'lucide-react';
import { useAppStore } from '@/lib/utils/appStore';
import { FORMATION_DEFINITIONS, FormationType } from '@/lib/constants/types';
import styles from '@/styles/modules/type.module.scss';

/**
 * FormationSelectorコンポーネント
 * 
 * フォーメーション選択機能を提供するコンポーネントです。
 * Radix UI Selectを使用して、定義済みのフォーメーションから選択できます。
 * 選択時にZustandストアを更新し、Tier数を動的に変更します。
 * 
 * 主な機能:
 * - 3つの定義済みフォーメーション（3銘柄、4銘柄、5銘柄）からの選択
 * - フォーメーション選択時の自動Tier数更新
 * - Zustandストアとの完全統合
 * - アクセシビリティ対応
 * 
 * @example
 * ```tsx
 * <FormationSelector />
 * ```
 * 
 * @returns FormationSelectorコンポーネント
 */
export default function FormationSelector() {
  const { selectedFormation, setSelectedFormation, clearFormation } = useAppStore(state => ({
    selectedFormation: state.selectedFormation,
    setSelectedFormation: state.setSelectedFormation,
    clearFormation: state.clearFormation
  }));

  /**
   * フォーメーション選択時の処理
   * @param value - 選択されたフォーメーションID
   */
  const handleFormationChange = (value: string) => {
    if (value === 'clear') {
      clearFormation();
      return;
    }

    const formation = FORMATION_DEFINITIONS.find(f => f.id === value);
    if (formation) {
      setSelectedFormation(formation);
    }
  };

  /**
   * 現在選択中の値を取得
   */
  const currentValue = selectedFormation?.id || '';

  return (
    <div className="formation-selector">
      <label className={styles['label--medium']}>
        フォーメーション選択
      </label>
      
      <Select.Root value={currentValue} onValueChange={handleFormationChange}>
        <Select.Trigger className="select-trigger" aria-label="フォーメーション選択">
          <Select.Value placeholder="フォーメーションを選択してください" />
          <Select.Icon className="select-icon">
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="select-content" position="popper">
            <Select.ScrollUpButton className="select-scroll-button">
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            
            <Select.Viewport className="select-viewport">
              {/* クリア選択肢 */}
              {selectedFormation && (
                <>
                  <Select.Item value="clear" className="select-item select-item--clear">
                    <Select.ItemText>選択をクリア</Select.ItemText>
                    <Select.ItemIndicator className="select-item-indicator">
                      <CheckIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                  <Select.Separator className="select-separator" />
                </>
              )}

              {/* フォーメーション選択肢 */}
              {FORMATION_DEFINITIONS.map((formation) => (
                <Select.Item 
                  key={formation.id} 
                  value={formation.id} 
                  className="select-item"
                >
                  <Select.ItemText>
                    <div className="formation-option">
                      <span className="formation-name">{formation.name}</span>
                      <span className="formation-detail">
                        {formation.percentages.join('-')}% ({formation.tiers}銘柄)
                      </span>
                    </div>
                  </Select.ItemText>
                  <Select.ItemIndicator className="select-item-indicator">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>

            <Select.ScrollDownButton className="select-scroll-button">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {/* 選択中のフォーメーション情報表示 */}
      {selectedFormation && (
        <div className="formation-info">
          <h3 className={styles['title--small']}>選択中のフォーメーション</h3>
          <div className="formation-details">
            <span className="formation-name">{selectedFormation.name}</span>
            <span className="formation-config">
              {selectedFormation.tiers}銘柄 - 配分: {selectedFormation.percentages.join(', ')}%
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .formation-selector {
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .select-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          min-height: 48px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-trigger:hover {
          border-color: #d1d5db;
          background-color: #f9fafb;
        }

        .select-trigger:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .select-trigger[data-state='open'] {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .select-icon {
          color: #6b7280;
          transition: transform 0.2s ease;
        }

        .select-trigger[data-state='open'] .select-icon {
          transform: rotate(180deg);
        }

        .select-content {
          overflow: hidden;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 1000;
        }

        .select-viewport {
          padding: 8px;
        }

        .select-item {
          display: flex;
          align-items: center;
          font-size: 15px;
          line-height: 1.4;
          color: #111827;
          border-radius: 4px;
          padding: 12px 16px 12px 32px;
          position: relative;
          user-select: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-item:focus {
          background-color: #f3f4f6;
          outline: none;
        }

        .select-item[data-state='checked'] {
          background-color: #eff6ff;
          color: #1d4ed8;
        }

        .select-item--clear {
          color: #dc2626;
        }

        .select-item-indicator {
          position: absolute;
          left: 8px;
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .select-separator {
          height: 1px;
          background-color: #e5e7eb;
          margin: 4px 8px;
        }

        .select-scroll-button {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 25px;
          background-color: white;
          color: #6b7280;
          cursor: default;
        }

        .formation-option {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .formation-name {
          font-weight: 500;
          color: #111827;
        }

        .formation-detail {
          font-size: 13px;
          color: #6b7280;
        }

        .formation-info {
          margin-top: 1rem;
          padding: 16px;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .formation-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
        }

        .formation-details .formation-name {
          font-weight: 600;
          color: #1e293b;
        }

        .formation-config {
          font-size: 14px;
          color: #64748b;
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .select-trigger {
            font-size: 16px; /* iOS zoomを防ぐ */
          }
          
          .formation-info {
            margin-top: 0.75rem;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}