import React, { useState } from 'react';
import { useAppStore } from '@/lib/utils/appStore';
import styles from '@/styles/modules/index.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';

/**
 * StockInputコンポーネント（簡略化版）
 *
 * Tier別の銘柄入力機能を提供するシンプルなコンポーネントです。
 * React #185エラーを回避するため、複雑なRadix UIを削減し、
 * 基本的なHTMLエレメントで構築しています。
 *
 * 主な機能:
 * - Tier表示
 * - 基本的なティッカー選択（selectエレメント）
 * - Entry価格・Hold株数入力
 * - Goal株数自動計算表示
 *
 * @returns StockInputコンポーネント
 */
export default function StockInput() {
  const { selectedFormation, budget } = useAppStore();

  // 各Tierの入力状態管理
  const [tierInputs, setTierInputs] = useState<{[key: number]: {
    ticker: string;
    entryPrice: string;
    holdShares: string;
  }}>({});

  // Goal株数計算
  const calculateGoalShares = (targetAmount: number, price: number) => {
    if (price <= 0) return 0;
    return Math.round(targetAmount / price);
  };

  // Tier入力値更新
  const updateTierInput = (tierIndex: number, field: string, value: string) => {
    setTierInputs(prev => ({
      ...prev,
      [tierIndex]: {
        ...prev[tierIndex],
        [field]: value
      }
    }));
  };

  // Tier入力値取得
  const getTierInput = (tierIndex: number) => {
    return tierInputs[tierIndex] || { ticker: '', entryPrice: '', holdShares: '' };
  };

  if (!selectedFormation) {
    return (
      <section className={`${styles.stockInputSection}`}>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
          <div className={`${gridStyles['col--12']}`}>
            <div className={styles.stockInputCard}>
              <p>フォーメーションを選択してください</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // サテライト銘柄リスト（簡略版）
  const satelliteTickers = [
    'NVDA', 'TSLA', 'AMD', 'PLTR', 'RKLB',
    'SOFI', 'HOOD', 'COIN', 'NET', 'ROKU'
  ];

  return (
    <section className={`${styles.stockInputSection}`}>
      <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
        <div className={`${gridStyles['col--12']}`}>
          <div className={styles.stockInputCard}>
            <h2 className={styles.stockInputTitle}>Tier別銘柄入力</h2>

            {selectedFormation.percentages.map((percentage, index) => {
              const tierNumber = index + 1;
              const targetAmount = (budget.funds * percentage) / 100;
              const tierInput = getTierInput(index);
              const goalShares = calculateGoalShares(targetAmount, parseFloat(tierInput.entryPrice) || 0);

              return (
                <div key={tierNumber} className="tier-section">
                  <div className="tier-header">
                    <h3>Tier {tierNumber}</h3>
                    <div className="tier-info">
                      <span className="balance-info">{percentage}%</span>
                      <span className="estimate-info">${targetAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="tier-inputs">
                    {/* ティッカー選択 */}
                    <div className="input-group">
                      <label>Ticker</label>
                      <select
                        value={tierInput.ticker}
                        onChange={(e) => updateTierInput(index, 'ticker', e.target.value)}
                        className="ticker-select"
                      >
                        <option value="">銘柄を選択</option>
                        {satelliteTickers.map(ticker => (
                          <option key={ticker} value={ticker}>{ticker}</option>
                        ))}
                      </select>
                    </div>

                    {/* Entry価格入力 */}
                    <div className="input-group">
                      <label>Entry</label>
                      <input
                        type="number"
                        value={tierInput.entryPrice}
                        onChange={(e) => updateTierInput(index, 'entryPrice', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="number-input"
                      />
                    </div>

                    {/* Hold株数入力 */}
                    <div className="input-group">
                      <label>Hold</label>
                      <input
                        type="number"
                        value={tierInput.holdShares}
                        onChange={(e) => updateTierInput(index, 'holdShares', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="number-input"
                      />
                    </div>

                    {/* Goal株数表示 */}
                    <div className="goal-display">
                      <label>Hold/Goal</label>
                      <span className="goal-value">
                        {tierInput.holdShares || 0}/{goalShares}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .tier-section {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          background: #f8fafc;
        }

        .tier-header {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          width: 100%;
        }

        .tier-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
          text-align: left;
          flex: 1;
        }

        .tier-info {
          display: flex !important;
          gap: 0.5rem;
          align-items: center;
          flex-shrink: 0;
        }

        .balance-info {
          font-size: 14px;
          font-weight: 600;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .balance-info::before {
          content: '[';
        }

        .balance-info::after {
          content: ']';
        }

        .estimate-info {
          font-size: 14px;
          font-weight: 600;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .estimate-info::before {
          content: '[';
        }

        .estimate-info::after {
          content: ']';
        }

        .tier-inputs {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 1rem;
          align-items: end;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .ticker-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          width: 100%;
          background: white;
        }

        .ticker-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .number-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          width: 100%;
        }

        .number-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .goal-display {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .goal-value {
          padding: 8px 12px;
          background: #e2e8f0;
          border-radius: 6px;
          font-weight: 500;
          color: #2d3748;
          text-align: center;
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .tier-inputs {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .tier-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .tier-header h3 {
            width: 100%;
            text-align: left;
          }

          .tier-info {
            align-self: flex-start;
            gap: 0.5rem;
          }

          .balance-info,
          .estimate-info {
            font-size: 13px;
            padding: 3px 6px;
          }
        }
      `}</style>
    </section>
  );
}
