import React, { useState } from 'react';
import {
  useSelectedFormation,
  useBudget,
  useTiers,
  useAddStockToTier
} from '@/lib/utils/appStore';
import { SATELLITE_TICKERS } from '@/lib/constants/ticker';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from '@/styles/modules/stockInput.module.scss';
import gridStyles from '@/styles/modules/grid.module.scss';
import gutterStyles from '@/styles/modules/gutter.module.scss';

/**
 * StockInputコンポーネント (Phase 3.3 最適化版)
 *
 * Tier別の銘柄入力機能を提供するコンポーネントです。
 * フォーメーション選択の下に内訳コンテンツは表示しません。
 *
 * 主な機能:
 * - Tier表示（詳細情報付き）
 * - ティッカー選択
 * - Entry価格・Hold株数入力
 * - Goal株数自動計算表示
 * - Phase 3.3: 自動保存は背景実行
 *
 * @returns StockInputコンポーネント
 */
export default function StockInput() {
  const selectedFormation = useSelectedFormation();
  const budget = useBudget();
  const tiers = useTiers();
  const addStockToTier = useAddStockToTier();

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

  // Tier入力値更新と自動保存
  const updateTierInput = (tierIndex: number, field: string, value: string) => {
    const newInputs = {
      ...tierInputs,
      [tierIndex]: {
        ...tierInputs[tierIndex],
        [field]: value
      }
    };
    setTierInputs(newInputs);

    // 自動保存（基本的なデータ更新のみ）
    if (selectedFormation) {
      const tierInput = newInputs[tierIndex];
      if (tierInput && tierInput.ticker) {
        const holdingData = {
          id: `tier-${tierIndex + 1}`,
          ticker: tierInput.ticker,
          entryPrice: parseFloat(tierInput.entryPrice) || 0,
          holdShares: parseInt(tierInput.holdShares) || 0,
          goalShares: calculateGoalShares((budget.funds * selectedFormation.percentages[tierIndex]) / 100, parseFloat(tierInput.entryPrice) || 0)
        };

        // Phase 3.3: 自動保存は背景で実行されるため、手動APIコールは不要
        // データ更新はaddStockToTierで自動的に保存される
        const tier = tiers[tierIndex];
        if (tier) {
          addStockToTier(tier.id, holdingData);
        }
      }
    }
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

  // フルポジ/ノーポジの場合は入力エリア非表示
  if (selectedFormation.id === 'formation_full_position' || selectedFormation.id === 'formation_no_position') {
    return (
      <section className={`${styles['stock-input--section']}`}>
        <div className={`${gridStyles['row--container']} ${gutterStyles.container}`}>
          <div className={`${gridStyles['col--12']}`}>
            <div className={styles['stock-input--card']}>
              <h2 className={styles['stock-input--title']}>Tier別銘柄入力</h2>
              <p className={styles['formation-message']}>
                {selectedFormation.name}が選択されています。Tier別の銘柄入力は不要です。
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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

                  <div className={styles['tier--content']}>
                    <div className={styles['tier--inputs']}>
                      {/* ティッカー選択 */}
                      <div className={styles['input--group']}>
                        <label>Ticker</label>
                        <Select.Root
                          value={tierInput.ticker}
                          onValueChange={(value) => updateTierInput(index, 'ticker', value)}
                        >
                          <Select.Trigger className={styles['ticker--select']}>
                            <Select.Value placeholder="銘柄を選択" />
                            <Select.Icon>
                              <ChevronDown size={16} />
                            </Select.Icon>
                          </Select.Trigger>

                          <Select.Portal>
                            <Select.Content className={styles['select--content']}>
                              <Select.ScrollUpButton>
                                <ChevronUp size={16} />
                              </Select.ScrollUpButton>

                              <Select.Viewport className={styles['select--viewport']}>
                                {SATELLITE_TICKERS.map(ticker => (
                                  <Select.Item key={ticker} value={ticker} className={styles['select--item']}>
                                    <Select.ItemText>{ticker}</Select.ItemText>
                                  </Select.Item>
                                ))}
                              </Select.Viewport>

                              <Select.ScrollDownButton>
                                <ChevronDown size={16} />
                              </Select.ScrollDownButton>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                      </div>

                      {/* Entry価格入力 */}
                      <div className={styles['input--group']}>
                        <label>Entry</label>
                        <input
                          type="number"
                          inputMode="decimal"
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
                          inputMode="numeric"
                          value={tierInput.holdShares}
                          onChange={(e) => updateTierInput(index, 'holdShares', e.target.value)}
                          placeholder="0"
                          min="0"
                          className={styles['number--input']}
                        />
                      </div>

                      {/* Hold/Goal表示 */}
                      <div className={styles['goal--display']}>
                        <label>Hold/Goal</label>
                        <span className={styles['goal--value']}>
                          {tierInput.holdShares || 0}/{goalShares}
                        </span>
                      </div>
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
