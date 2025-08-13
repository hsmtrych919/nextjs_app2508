import React, { useState } from 'react';
import { DollarSignIcon, TrendingUpIcon, PiggyBankIcon } from 'lucide-react';
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
 * - シンプルなローカル状態管理
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
  const [funds, setFunds] = useState(6000);
  const [start, setStart] = useState(6000);
  const [profit, setProfit] = useState(0);

  // Return%計算
  const returnPercentage = start > 0 ? ((profit / start) * 100) : 0;

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
              type="number"
              className="budget-input"
              placeholder="6000.00"
              value={funds}
              onChange={(e) => setFunds(parseFloat(e.target.value) || 0)}
            />
          </div>
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
              type="number"
              className="budget-input"
              placeholder="0.00"
              value={start}
              onChange={(e) => setStart(parseFloat(e.target.value) || 0)}
            />
          </div>
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
              type="number"
              className="budget-input profit-input"
              placeholder="0.00"
              value={profit}
              onChange={(e) => setProfit(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Return％表示 */}
        <div className="return-display">
          <div className="return-card">
            <div className="return-header">
              <h3 className={styles['title--small']}>Return %</h3>
              <div className={`return-value ${returnPercentage >= 0 ? 'positive' : 'negative'}`}>
                {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
              </div>
            </div>
            <div className="return-calculation">
              {start > 0 ? (
                <span className="calculation-formula">
                  ${profit.toFixed(2)} ÷ ${start.toFixed(2)} × 100
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
        {funds > 0 && (
          <div className="budget-summary">
            <h3 className={styles['title--small']}>予算概要</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">総予算</span>
                <span className="summary-value">${funds.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">開始元本</span>
                <span className="summary-value">${start.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">現在利益</span>
                <span className={`summary-value ${profit >= 0 ? 'positive' : 'negative'}`}>
                  ${profit >= 0 ? '+' : ''}${profit.toLocaleString()}
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