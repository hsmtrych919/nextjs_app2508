import React, { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, TrendingUpIcon, DollarSignIcon } from 'lucide-react';
import { useAppStore } from '@/lib/utils/appStore';
import { SATELLITE_TICKERS } from '@/lib/constants/ticker';
import { calculateGoalShares, calculateInvestmentAmount } from '@/lib/utils/calculations';
import styles from '@/styles/modules/type.module.scss';

/**
 * StockInputコンポーネント
 * 
 * Tier別の銘柄入力機能を提供するコンポーネントです。
 * 各Tierに対してティッカー選択、価格・株数入力、自動計算を行います。
 * 
 * 主な機能:
 * - Tier別入力エリア（フォーメーション選択に基づく）
 * - ティッカー選択（Radix UI Select使用）
 * - Entry価格・Hold株数入力（数値キーボード対応）
 * - Goal株数自動計算・表示
 * - Hold/Goal比率表示
 * - Zustandストア完全統合
 * 
 * @example
 * ```tsx
 * <StockInput />
 * ```
 * 
 * @returns StockInputコンポーネント
 */
export default function StockInput() {
  const { 
    selectedFormation, 
    tiers, 
    budget,
    addStockToTier, 
    updateStockInTier, 
    removeStockFromTier 
  } = useAppStore(state => ({
    selectedFormation: state.selectedFormation,
    tiers: state.tiers,
    budget: state.budget,
    addStockToTier: state.addStockToTier,
    updateStockInTier: state.updateStockInTier,
    removeStockFromTier: state.removeStockFromTier
  }));

  // 各Tierの入力状態
  const [tierInputs, setTierInputs] = useState<{[tierId: string]: {
    ticker: string;
    entryPrice: string;
    holdShares: string;
    isValid: boolean;
  }}>({});

  // フォーメーション変更時に入力状態をリセット
  useEffect(() => {
    if (selectedFormation && tiers.length > 0) {
      const initialInputs: typeof tierInputs = {};
      tiers.forEach(tier => {
        initialInputs[tier.id] = {
          ticker: '',
          entryPrice: '',
          holdShares: '',
          isValid: false
        };
      });
      setTierInputs(initialInputs);
    }
  }, [selectedFormation, tiers.length]);

  /**
   * 入力値検証
   */
  const validateInput = (tierId: string, ticker: string, entryPrice: string, holdShares: string): boolean => {
    return ticker !== '' && 
           parseFloat(entryPrice) > 0 && 
           parseInt(holdShares) > 0;
  };

  /**
   * Tierの入力値を更新
   */
  const updateTierInput = (tierId: string, field: keyof typeof tierInputs[string], value: string) => {
    setTierInputs(prev => {
      const currentInput = prev[tierId] || { ticker: '', entryPrice: '', holdShares: '', isValid: false };
      const updated = { ...currentInput, [field]: value };
      
      // 入力値検証
      updated.isValid = validateInput(tierId, updated.ticker, updated.entryPrice, updated.holdShares);
      
      return { ...prev, [tierId]: updated };
    });
  };

  /**
   * 銘柄をTierに追加
   */
  const addStockToTierHandler = (tierId: string) => {
    const input = tierInputs[tierId];
    if (!input || !input.isValid) return;

    const entryPrice = parseFloat(input.entryPrice);
    const holdShares = parseInt(input.holdShares);
    const tier = tiers.find(t => t.id === tierId);
    
    if (!tier) return;

    // Goal株数を計算
    const goalShares = calculateGoalShares(tier.targetAmount, entryPrice);

    const newStock = {
      id: `${tierId}_${input.ticker}_${Date.now()}`,
      ticker: input.ticker,
      entryPrice,
      holdShares,
      goalShares,
      lastUpdated: new Date()
    };

    addStockToTier(tierId, newStock);

    // 入力欄をクリア
    setTierInputs(prev => ({
      ...prev,
      [tierId]: { ticker: '', entryPrice: '', holdShares: '', isValid: false }
    }));
  };

  /**
   * 銘柄をTierから削除
   */
  const removeStockHandler = (tierId: string, stockId: string) => {
    removeStockFromTier(tierId, stockId);
  };

  /**
   * 進捗率計算
   */
  const calculateTierProgress = (tier: any): number => {
    if (tier.targetAmount <= 0) return 0;
    
    const totalInvested = tier.stocks.reduce((sum: number, stock: any) => {
      return sum + calculateInvestmentAmount(stock.holdShares, stock.entryPrice);
    }, 0);
    
    return Math.min(100, Math.round((totalInvested / tier.targetAmount) * 100));
  };

  // フォーメーション未選択時の表示
  if (!selectedFormation || tiers.length === 0) {
    return (
      <div className="stock-input-empty">
        <div className="empty-state">
          <TrendingUpIcon size={48} className="empty-icon" />
          <h3 className={styles['title--small']}>フォーメーションを選択してください</h3>
          <p className="empty-message">
            銘柄を追加するには、まずフォーメーションを選択する必要があります。
          </p>
        </div>
        
        <style jsx>{`
          .stock-input-empty {
            width: 100%;
            padding: 2rem 0;
          }
          
          .empty-state {
            text-align: center;
            color: #6b7280;
          }
          
          .empty-icon {
            margin: 0 auto 1rem;
            color: #d1d5db;
          }
          
          .empty-message {
            font-size: 14px;
            line-height: 1.5;
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="stock-input">
      <div className="stock-input-header">
        <h2 className={styles['title--medium']}>銘柄入力</h2>
        <p className="header-description">
          各Tierに銘柄を追加して、ポートフォリオを構築しましょう。
        </p>
      </div>

      {tiers.map((tier, index) => {
        const currentInput = tierInputs[tier.id] || { ticker: '', entryPrice: '', holdShares: '', isValid: false };
        const progress = calculateTierProgress(tier);
        const tierNumber = index + 1;
        const tierPercentage = selectedFormation.percentages[index];

        return (
          <div key={tier.id} className="tier-section">
            {/* Tier ヘッダー */}
            <div className="tier-header">
              <div className="tier-info">
                <h3 className={styles['title--small']}>
                  Tier {tierNumber} ({tierPercentage}%)
                </h3>
                <div className="tier-stats">
                  <span className="target-amount">
                    <DollarSignIcon size={16} />
                    目標: ${tier.targetAmount.toLocaleString()}
                  </span>
                  <span className="progress-text">進捗: {progress}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* 既存銘柄表示 */}
            {tier.stocks.length > 0 && (
              <div className="existing-stocks">
                <h4 className="stocks-title">保有銘柄</h4>
                {tier.stocks.map((stock) => {
                  const investedAmount = calculateInvestmentAmount(stock.holdShares, stock.entryPrice);
                  const holdGoalRatio = stock.goalShares > 0 ? (stock.holdShares / stock.goalShares * 100) : 0;
                  
                  return (
                    <div key={stock.id} className="stock-item">
                      <div className="stock-main-info">
                        <span className="ticker-name">{stock.ticker}</span>
                        <span className="stock-amounts">
                          ${stock.entryPrice} × {stock.holdShares}株 = ${investedAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="stock-sub-info">
                        <span className="goal-info">
                          目標: {stock.goalShares}株 ({holdGoalRatio.toFixed(1)}%)
                        </span>
                        <button 
                          className="remove-button"
                          onClick={() => removeStockHandler(tier.id, stock.id)}
                          title="銘柄を削除"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 新規銘柄追加フォーム */}
            <div className="add-stock-form">
              <h4 className="form-title">銘柄を追加</h4>
              
              {/* ティッカー選択 */}
              <div className="input-group">
                <label className="input-label">ティッカー</label>
                <Select.Root 
                  value={currentInput.ticker} 
                  onValueChange={(value) => updateTierInput(tier.id, 'ticker', value)}
                >
                  <Select.Trigger className="select-trigger">
                    <Select.Value placeholder="銘柄を選択" />
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
                        {SATELLITE_TICKERS.map((ticker) => (
                          <Select.Item key={ticker} value={ticker} className="select-item">
                            <Select.ItemText>{ticker}</Select.ItemText>
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
              </div>

              <div className="input-row">
                {/* Entry価格入力 */}
                <div className="input-group input-group--half">
                  <label className="input-label">Entry価格 ($)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="number-input"
                    placeholder="0.00"
                    value={currentInput.entryPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 数値と小数点のみ許可
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        updateTierInput(tier.id, 'entryPrice', value);
                      }
                    }}
                  />
                </div>

                {/* Hold株数入力 */}
                <div className="input-group input-group--half">
                  <label className="input-label">Hold株数</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="number-input"
                    placeholder="0"
                    value={currentInput.holdShares}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 整数のみ許可
                      if (value === '' || /^\d+$/.test(value)) {
                        updateTierInput(tier.id, 'holdShares', value);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Goal株数計算結果表示 */}
              {currentInput.ticker && currentInput.entryPrice && parseFloat(currentInput.entryPrice) > 0 && (
                <div className="goal-calculation">
                  <span className="goal-label">Goal株数:</span>
                  <span className="goal-value">
                    {calculateGoalShares(tier.targetAmount, parseFloat(currentInput.entryPrice))}株
                  </span>
                  <span className="goal-note">
                    (目標${tier.targetAmount.toLocaleString()} ÷ ${currentInput.entryPrice})
                  </span>
                </div>
              )}

              {/* 追加ボタン */}
              <button
                className={`add-button ${currentInput.isValid ? 'add-button--active' : ''}`}
                onClick={() => addStockToTierHandler(tier.id)}
                disabled={!currentInput.isValid}
              >
                Tier {tierNumber}に追加
              </button>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .stock-input {
          width: 100%;
          padding: 1rem 0;
        }

        .stock-input-header {
          margin-bottom: 2rem;
        }

        .header-description {
          font-size: 14px;
          color: #6b7280;
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .tier-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .tier-header {
          margin-bottom: 1.5rem;
        }

        .tier-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .tier-stats {
          display: flex;
          gap: 1rem;
          align-items: center;
          font-size: 14px;
          color: #64748b;
        }

        .target-amount {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          transition: width 0.3s ease;
        }

        .existing-stocks {
          margin-bottom: 1.5rem;
        }

        .stocks-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .stock-item {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.75rem;
        }

        .stock-main-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .ticker-name {
          font-weight: 600;
          color: #111827;
          font-size: 16px;
        }

        .stock-amounts {
          font-size: 14px;
          color: #6b7280;
        }

        .stock-sub-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .goal-info {
          font-size: 13px;
          color: #64748b;
        }

        .remove-button {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s ease;
        }

        .remove-button:hover {
          background: #dc2626;
        }

        .add-stock-form {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .form-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .input-group {
          margin-bottom: 1rem;
        }

        .input-group--half {
          flex: 1;
        }

        .input-row {
          display: flex;
          gap: 1rem;
        }

        .input-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
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
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-trigger:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .select-icon {
          color: #6b7280;
        }

        .select-content {
          overflow: hidden;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 1000;
          max-height: 200px;
        }

        .select-viewport {
          padding: 8px;
        }

        .select-item {
          display: flex;
          align-items: center;
          font-size: 15px;
          color: #111827;
          border-radius: 4px;
          padding: 8px 12px 8px 28px;
          position: relative;
          cursor: pointer;
          user-select: none;
        }

        .select-item:focus {
          background-color: #f3f4f6;
          outline: none;
        }

        .select-item[data-state='checked'] {
          background-color: #eff6ff;
          color: #1d4ed8;
        }

        .select-item-indicator {
          position: absolute;
          left: 6px;
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
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

        .number-input {
          width: 100%;
          padding: 12px 16px;
          min-height: 48px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s ease;
        }

        .number-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .goal-calculation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 14px;
        }

        .goal-label {
          font-weight: 500;
          color: #1e40af;
        }

        .goal-value {
          font-weight: 600;
          color: #1d4ed8;
          font-size: 16px;
        }

        .goal-note {
          color: #64748b;
          font-size: 13px;
        }

        .add-button {
          width: 100%;
          padding: 12px 24px;
          min-height: 48px;
          background: #e5e7eb;
          color: #9ca3af;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: not-allowed;
          transition: all 0.2s ease;
        }

        .add-button--active {
          background: #3b82f6;
          color: white;
          cursor: pointer;
        }

        .add-button--active:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .stock-input {
            padding: 0.5rem 0;
          }

          .tier-section {
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .tier-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .tier-stats {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .input-row {
            flex-direction: column;
            gap: 1rem;
          }

          .select-trigger,
          .number-input,
          .add-button {
            font-size: 16px; /* iOS zoomを防ぐ */
          }

          .goal-calculation {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}