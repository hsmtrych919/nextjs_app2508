import React, { useEffect } from 'react';
import { DollarSignIcon, TrendingUpIcon, PiggyBankIcon } from 'lucide-react';
import { useAppStore } from '@/lib/utils/appStore';
import { calculateReturnPercentage } from '@/lib/utils/calculations';
import styles from '@/styles/modules/type.module.scss';

/**
 * BudgetManagerコンポーネント
 * 
 * 予算管理機能を提供するコンポーネントです。
 * Funds（資金）、Start（開始元本）、Profit（利益）の入力と
 * Return％の自動計算・表示を行います。
 * 
 * 主な機能:
 * - Funds、Start、Profit入力フィールド
 * - Return％の自動計算・表示
 * - Zustandストアとの完全統合
 * - モバイル対応のレスポンシブデザイン
 * 
 * @example
 * ```tsx
 * <BudgetManager />
 * ```
 * 
 * @returns BudgetManagerコンポーネント
 */
export default function BudgetManager() {
  const { budget, updateBudget } = useAppStore(state => ({
    budget: state.budget,
    updateBudget: state.updateBudget
  }));

  /**
   * フィールド値更新ハンドラ
   */
  const handleFieldChange = (field: keyof typeof budget, value: string) => {
    const numericValue = parseFloat(value) || 0;
    updateBudget({ [field]: numericValue });
  };

  /**
   * Return％自動計算
   */
  useEffect(() => {
    if (budget.start > 0) {
      const returnPercentage = calculateReturnPercentage(budget.profit, budget.start);
      if (returnPercentage !== budget.returnPercentage) {
        updateBudget({ returnPercentage });
      }
    }
  }, [budget.profit, budget.start, budget.returnPercentage, updateBudget]);

  return (
    <div className="budget-manager">
      <div className="budget-header">
        <h2 className={styles['title--medium']}>予算管理</h2>
        <p className="header-description">
          投資予算と利益状況を管理しましょう。
        </p>
      </div>

      <div className="budget-form">
        {/* Funds入力 */}
        <div className="input-group">
          <label className="input-label">
            <PiggyBankIcon size={16} className="label-icon" />
            Funds (投資予算)
          </label>
          <div className="input-wrapper">
            <span className="input-prefix">$</span>
            <input
              type="text"
              inputMode="decimal"
              className="budget-input"
              placeholder="6000.00"
              value={budget.funds || ''}
              onChange={(e) => {
                const value = e.target.value;
                // 数値と小数点のみ許可
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleFieldChange('funds', value);
                }
              }}
            />
          </div>
          <p className="input-help">
            サテライト投資に使用する総予算を入力してください
          </p>
        </div>

        {/* Start入力 */}
        <div className="input-group">
          <label className="input-label">
            <DollarSignIcon size={16} className="label-icon" />
            Start (開始元本)
          </label>
          <div className="input-wrapper">
            <span className="input-prefix">$</span>
            <input
              type="text"
              inputMode="decimal"
              className="budget-input"
              placeholder="0.00"
              value={budget.start || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleFieldChange('start', value);
                }
              }}
            />
          </div>
          <p className="input-help">
            投資開始時の元本金額を入力してください
          </p>
        </div>

        {/* Profit入力 */}
        <div className="input-group">
          <label className="input-label">
            <TrendingUpIcon size={16} className="label-icon" />
            Profit (利益)
          </label>
          <div className="input-wrapper">
            <span className="input-prefix">$</span>
            <input
              type="text"
              inputMode="decimal"
              className="budget-input profit-input"
              placeholder="0.00"
              value={budget.profit || ''}
              onChange={(e) => {
                const value = e.target.value;
                // 負の値も許可
                if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                  handleFieldChange('profit', value);
                }
              }}
            />
          </div>
          <p className="input-help">
            現在の利益（損失の場合は負の値）を入力してください
          </p>
        </div>

        {/* Return％表示 */}
        <div className="return-display">
          <div className="return-card">
            <div className="return-header">
              <h3 className={styles['title--small']}>Return %</h3>
              <div className={`return-value ${budget.returnPercentage >= 0 ? 'positive' : 'negative'}`}>
                {budget.returnPercentage >= 0 ? '+' : ''}{budget.returnPercentage.toFixed(2)}%
              </div>
            </div>
            <div className="return-calculation">
              {budget.start > 0 ? (
                <span className="calculation-formula">
                  ${budget.profit.toFixed(2)} ÷ ${budget.start.toFixed(2)} × 100
                </span>
              ) : (
                <span className="calculation-note">
                  開始元本を入力するとReturn％が計算されます
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 予算概要 */}
        {budget.funds > 0 && (
          <div className="budget-summary">
            <h3 className={styles['title--small']}>予算概要</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">総予算</span>
                <span className="summary-value">${budget.funds.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">開始元本</span>
                <span className="summary-value">${budget.start.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">現在利益</span>
                <span className={`summary-value ${budget.profit >= 0 ? 'positive' : 'negative'}`}>
                  ${budget.profit >= 0 ? '+' : ''}${budget.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .budget-manager {
          width: 100%;
          padding: 1rem 0;
        }

        .budget-header {
          margin-bottom: 2rem;
        }

        .header-description {
          font-size: 14px;
          color: #6b7280;
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .budget-form {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
        }

        .input-group {
          margin-bottom: 2rem;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .label-icon {
          color: #6b7280;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-prefix {
          position: absolute;
          left: 16px;
          font-size: 16px;
          font-weight: 500;
          color: #6b7280;
          z-index: 1;
        }

        .budget-input {
          width: 100%;
          padding: 12px 16px 12px 32px;
          min-height: 48px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          color: #111827;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .budget-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .profit-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .input-help {
          font-size: 12px;
          color: #64748b;
          margin-top: 0.5rem;
          line-height: 1.4;
        }

        .return-display {
          margin: 2.5rem 0;
        }

        .return-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 2rem;
          color: white;
          text-align: center;
        }

        .return-header {
          margin-bottom: 1rem;
        }

        .return-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-top: 0.5rem;
        }

        .return-value.positive {
          color: #10f981;
        }

        .return-value.negative {
          color: #fbbf24;
        }

        .return-calculation {
          margin-top: 1rem;
          opacity: 0.9;
        }

        .calculation-formula {
          font-size: 14px;
          font-weight: 500;
        }

        .calculation-note {
          font-size: 13px;
          font-style: italic;
        }

        .budget-summary {
          margin-top: 2rem;
          padding: 1.5rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: center;
        }

        .summary-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .summary-value {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .summary-value.positive {
          color: #10b981;
        }

        .summary-value.negative {
          color: #f59e0b;
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .budget-manager {
            padding: 0.5rem 0;
          }

          .budget-form {
            padding: 1.5rem;
            margin: 0 -0.5rem;
          }

          .budget-input {
            font-size: 16px; /* iOS zoomを防ぐ */
          }

          .return-card {
            padding: 1.5rem;
          }

          .return-value {
            font-size: 2rem;
          }

          .summary-grid {
            grid-template-columns: 1fr;
            text-align: left;
          }

          .summary-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
          }

          .summary-item:last-child {
            border-bottom: none;
          }
        }

        /* 高解像度・大画面対応 */
        @media (min-width: 1024px) {
          .budget-form {
            padding: 2.5rem;
          }

          .summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}