/**
 * BudgetManager Component
 *
 * 投資予算の管理を行うコンポーネント
 * - 総予算（Funds）の設定
 * - 開始元本（Start）の設定
 * - 現在利益（Profit）の入力
 * - 利回り（Return%）の自動計算と表示
 * - 予算概要の表示
 */

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { useAppStore } from '@/lib/utils/appStore';
import styles from '../../styles/modules/budgetManager.module.scss';

export default function BudgetManager() {
  const { budget, updateBudget } = useAppStore();

  // ローカル状態をZustandストアで初期化
  const [funds, setFunds] = useState<number>(budget.funds || 6000);
  const [start, setStart] = useState<number>(budget.start || 0);
  const [profit, setProfit] = useState<number>(budget.profit || 0);

  // ストアの値が変更されたらローカル状態を同期
  useEffect(() => {
    setFunds(budget.funds || 6000);
    setStart(budget.start || 0);
    setProfit(budget.profit || 0);
  }, [budget.funds, budget.start, budget.profit]);

  // 値変更時の自動保存ハンドラー
  const handleFundsChange = (value: number) => {
    setFunds(value);
    updateBudget({ funds: value });
  };

  const handleStartChange = (value: number) => {
    setStart(value);
    updateBudget({ start: value });
  };

  const handleProfitChange = (value: number) => {
    setProfit(value);
    updateBudget({ profit: value });
  };

  // 利回り計算: (現在利益 / 開始元本) × 100
  const returnPercentage = start > 0 ? ((profit / start) * 100) : 0;

  return (
    <div className={styles['budget-manager--wrap']}>

      <div className={styles['budget--form']}>
      <div className={styles['budget--header']}>
        <h2 className={styles['title--large']}>
          <Calculator className={styles['title--icon']} />
          投資予算管理
        </h2>
        <p className={styles['header--description']}>
          投資予算と利益状況を管理し、リアルタイムで利回りを確認できます。
          総予算と開始元本を設定し、現在の利益を入力してください。
        </p>
      </div>
        {/* 総予算入力 */}
        <div className={styles['budget-input--group']}>
          <label className={styles['budget-input--label']}>
            <DollarSign className={styles['label--icon']} />
            総予算 (Funds)
          </label>
          <div className={styles['budget-input--wrapper']}>
            <span className={styles['budget-input--prefix']}>$</span>
            <input
              type="number"
              value={funds || ''}
              onChange={(e) => handleFundsChange(Number(e.target.value) || 0)}
              placeholder="投資に使用する総予算を入力"
              className={`${styles['budget--input']} ${styles['funds--input']}`}
            />
          </div>
          <p className={styles['budget-input--help']}>
            投資に利用可能な総資金を設定してください。
          </p>
        </div>

        {/* 開始元本入力 */}
        <div className={styles['budget-input--group']}>
          <label className={styles['budget-input--label']}>
            <TrendingUp className={styles['label--icon']} />
            開始元本 (Start)
          </label>
          <div className={styles['budget-input--wrapper']}>
            <span className={styles['budget-input--prefix']}>$</span>
            <input
              type="number"
              value={start || ''}
              onChange={(e) => handleStartChange(Number(e.target.value) || 0)}
              placeholder="投資開始時の元本を入力"
              className={`${styles['budget--input']} ${styles['start--input']}`}
            />
          </div>
          <p className={styles['budget-input--help']}>
            投資を開始した時点での元本額を入力してください。
          </p>
        </div>

        {/* 現在利益入力 */}
        <div className={styles['budget-input--group']}>
          <label className={styles['budget-input--label']}>
            <Calculator className={styles['label--icon']} />
            現在利益 (Profit)
          </label>
          <div className={styles['budget-input--wrapper']}>
            <span className={styles['budget-input--prefix']}>$</span>
            <input
              type="number"
              value={profit || ''}
              onChange={(e) => handleProfitChange(Number(e.target.value) || 0)}
              placeholder="現在の利益または損失を入力"
              className={`${styles['budget--input']} ${styles['profit--input']}`}
            />
          </div>
          <p className={styles['budget-input--help']}>
            現在の利益（プラス）または損失（マイナス）を入力してください。
          </p>
        </div>

        {/* 利回り表示 - 常時表示 */}
        <div className={styles['budget-return--section']}>
          <div className={styles.budgetReturnCard}>
            <div className={styles.budgetReturnHeader}>
              <h3 className={styles['budget-return--title']}>現在の利回り</h3>
            </div>
            <div className={`${styles['budget-return--value']} ${returnPercentage < 0 ? styles.negative : ''}`}>
              {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
            </div>
            <div className={styles.budgetReturnCalc}>
              <p className={styles.calcFormula}>
                計算式: ({profit.toLocaleString()} ÷ {start.toLocaleString()}) × 100
              </p>
              <p className={styles.calcNote}>
                ※ 利回り = (現在利益 ÷ 開始元本) × 100
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
