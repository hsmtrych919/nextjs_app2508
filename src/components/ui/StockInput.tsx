import React, { useState } from 'react';
import { useAppStore } from '@/lib/utils/appStore';
import styles from '@/styles/modules/stockInput.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';

/**
 * StockInputコンポーネント
 *
 * Tier別の銘柄入力機能を提供するコンポーネントです。
 * フォーメーション選択の下に内訳コンテンツは表示しません。
 *
 * 主な機能:
 * - Tier表示（詳細情報付き）
 * - ティッカー選択
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

  // サテライト銘柄リスト
  const satelliteTickers = [
    'NVDA', 'TSLA', 'AMD', 'PLTR', 'RKLB',
    'SOFI', 'HOOD', 'COIN', 'NET', 'ROKU'
  ];

  return (
    <section className={`${styles['stock-input--section']}`}>
      <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
        <div className={`${gridStyles['col--12']}`}>
          <div className={styles['stock-input--card']}>
            <h2 className={styles['stock-input--title']}>Tier別銘柄入力</h2>

            {selectedFormation.percentages.map((percentage, index) => {
              const tierNumber = index + 1;
              const targetAmount = (budget.funds * percentage) / 100;
              const tierInput = getTierInput(index);
              const goalShares = calculateGoalShares(targetAmount, parseFloat(tierInput.entryPrice) || 0);

              return (
                <div key={tierNumber} className={styles['tier--section']}>
                  <div className={styles['tier--header']}>
                    <h3>Tier {tierNumber}</h3>
                    <div className={styles['tier--details']}>
                      <span className={styles['tier--percentage']}>{percentage}%</span>
                      <span className={styles['tier--amount']}>${targetAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={styles['tier--inputs']}>
                    {/* ティッカー選択 */}
                    <div className={styles['input--group']}>
                      <label>Ticker</label>
                      <select
                        value={tierInput.ticker}
                        onChange={(e) => updateTierInput(index, 'ticker', e.target.value)}
                        className={styles['ticker--select']}
                      >
                        <option value="">銘柄を選択</option>
                        {satelliteTickers.map(ticker => (
                          <option key={ticker} value={ticker}>{ticker}</option>
                        ))}
                      </select>
                    </div>

                    {/* Entry価格入力 */}
                    <div className={styles['input--group']}>
                      <label>Entry</label>
                      <input
                        type="number"
                        value={tierInput.entryPrice}
                        onChange={(e) => updateTierInput(index, 'entryPrice', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={styles['number--input']}
                      />
                    </div>

                    {/* Hold株数入力 */}
                    <div className={styles['input--group']}>
                      <label>Hold</label>
                      <input
                        type="number"
                        value={tierInput.holdShares}
                        onChange={(e) => updateTierInput(index, 'holdShares', e.target.value)}
                        placeholder="0"
                        min="0"
                        className={styles['number--input']}
                      />
                    </div>

                    {/* Goal株数表示 */}
                    <div className={styles['goal--display']}>
                      <label>Hold/Goal</label>
                      <span className={styles['goal--value']}>
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
    </section>
  );
}
