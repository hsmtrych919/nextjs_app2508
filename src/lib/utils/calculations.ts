import Decimal from 'decimal.js';
import { StockHoldingType, TierType, BudgetType } from '../constants/types';

/**
 * 高精度な数値計算ユーティリティ（Decimal.js使用）
 */

// Decimal.jsの設定
Decimal.config({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  modulo: Decimal.ROUND_DOWN,
  toExpNeg: -7,
  toExpPos: 21
});

/**
 * 目標株数を計算する
 * @param targetAmount 目標金額
 * @param currentPrice 現在価格
 * @returns 目標株数（四捨五入）
 */
export const calculateGoalShares = (targetAmount: number, currentPrice: number): number => {
  if (currentPrice <= 0) return 0;
  
  const amount = new Decimal(targetAmount);
  const price = new Decimal(currentPrice);
  
  return Math.round(amount.dividedBy(price).toNumber());
};

/**
 * 投資額を計算する
 * @param shares 株数
 * @param price 価格
 * @returns 投資額
 */
export const calculateInvestmentAmount = (shares: number, price: number): number => {
  const sharesDecimal = new Decimal(shares);
  const priceDecimal = new Decimal(price);
  
  return sharesDecimal.mul(priceDecimal).toNumber();
};

/**
 * 現在の評価額を計算する
 * @param shares 株数
 * @param currentPrice 現在価格
 * @returns 現在の評価額
 */
export const calculateCurrentValue = (shares: number, currentPrice: number): number => {
  return calculateInvestmentAmount(shares, currentPrice);
};

/**
 * 損益を計算する
 * @param holdShares 保有株数
 * @param entryPrice エントリー価格
 * @param currentPrice 現在価格
 * @returns 損益金額
 */
export const calculateProfitLoss = (holdShares: number, entryPrice: number, currentPrice: number): number => {
  const shares = new Decimal(holdShares);
  const entry = new Decimal(entryPrice);
  const current = new Decimal(currentPrice);
  
  const entryValue = shares.mul(entry);
  const currentValue = shares.mul(current);
  
  return currentValue.minus(entryValue).toNumber();
};

/**
 * 損益率を計算する
 * @param holdShares 保有株数
 * @param entryPrice エントリー価格
 * @param currentPrice 現在価格
 * @returns 損益率（%）
 */
export const calculateProfitLossPercentage = (holdShares: number, entryPrice: number, currentPrice: number): number => {
  if (entryPrice <= 0) return 0;
  
  const entry = new Decimal(entryPrice);
  const current = new Decimal(currentPrice);
  
  const percentageChange = current.minus(entry).dividedBy(entry).mul(100);
  
  return Math.round(percentageChange.toNumber() * 100) / 100; // 小数点以下2桁
};

/**
 * Tierの進捗率を計算する
 * @param tier Tier情報
 * @returns 進捗率（%）
 */
export const calculateTierProgress = (tier: TierType): number => {
  if (tier.targetAmount <= 0) return 0;
  
  const totalInvested = tier.stocks.reduce((sum, stock) => {
    return sum + calculateInvestmentAmount(stock.holdShares, stock.entryPrice);
  }, 0);
  
  const target = new Decimal(tier.targetAmount);
  const invested = new Decimal(totalInvested);
  
  const progress = invested.dividedBy(target).mul(100);
  
  return Math.min(100, Math.round(progress.toNumber() * 100) / 100);
};

/**
 * Tier内の銘柄の合計評価額を計算する
 * @param stocks Tier内の銘柄リスト
 * @returns 合計評価額
 */
export const calculateTierCurrentValue = (stocks: StockHoldingType[]): number => {
  return stocks.reduce((sum, stock) => {
    const currentPrice = stock.currentPrice || stock.entryPrice;
    return sum + calculateCurrentValue(stock.holdShares, currentPrice);
  }, 0);
};

/**
 * Tier内の銘柄の合計損益を計算する
 * @param stocks Tier内の銘柄リスト
 * @returns 合計損益
 */
export const calculateTierProfitLoss = (stocks: StockHoldingType[]): number => {
  return stocks.reduce((sum, stock) => {
    const currentPrice = stock.currentPrice || stock.entryPrice;
    return sum + calculateProfitLoss(stock.holdShares, stock.entryPrice, currentPrice);
  }, 0);
};

/**
 * 年利を計算する
 * @param initialAmount 初期投資額
 * @param currentAmount 現在の評価額
 * @param years 経過年数
 * @returns 年利（%）
 */
export const calculateAnnualReturn = (initialAmount: number, currentAmount: number, years: number): number => {
  if (initialAmount <= 0 || years <= 0) return 0;
  
  const initial = new Decimal(initialAmount);
  const current = new Decimal(currentAmount);
  const yearsDecimal = new Decimal(years);
  
  // (現在の評価額 / 初期投資額) ^ (1/年数) - 1
  const ratio = current.dividedBy(initial);
  const annualReturn = ratio.pow(yearsDecimal.pow(-1)).minus(1).mul(100);
  
  return Math.round(annualReturn.toNumber() * 100) / 100;
};

/**
 * リターン率を計算する
 * @param profit 利益
 * @param startAmount 開始元本
 * @returns リターン率（%）
 */
export const calculateReturnPercentage = (profit: number, startAmount: number): number => {
  if (startAmount <= 0) return 0;
  
  const profitDecimal = new Decimal(profit);
  const startDecimal = new Decimal(startAmount);
  
  const returnRate = profitDecimal.dividedBy(startDecimal).mul(100);
  
  return Math.round(returnRate.toNumber() * 100) / 100;
};

/**
 * 必要追加投資額を計算する
 * @param targetAmount 目標金額
 * @param currentInvested 現在の投資済み金額
 * @returns 必要追加投資額
 */
export const calculateAdditionalInvestmentNeeded = (targetAmount: number, currentInvested: number): number => {
  const target = new Decimal(targetAmount);
  const current = new Decimal(currentInvested);
  
  const needed = target.minus(current);
  
  return Math.max(0, needed.toNumber());
};

/**
 * ポートフォリオ全体のサマリーを計算する
 * @param tiers 全Tierデータ
 * @param budget 予算情報
 * @returns ポートフォリオサマリー
 */
export const calculatePortfolioSummary = (tiers: TierType[], budget: BudgetType) => {
  const totalInvested = tiers.reduce((sum, tier) => {
    return sum + tier.stocks.reduce((tierSum, stock) => {
      return tierSum + calculateInvestmentAmount(stock.holdShares, stock.entryPrice);
    }, 0);
  }, 0);
  
  const totalCurrentValue = tiers.reduce((sum, tier) => {
    return sum + calculateTierCurrentValue(tier.stocks);
  }, 0);
  
  const totalProfitLoss = tiers.reduce((sum, tier) => {
    return sum + calculateTierProfitLoss(tier.stocks);
  }, 0);
  
  const remainingFunds = budget.funds - totalInvested;
  
  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
    totalProfitLossPercentage: totalInvested > 0 ? calculateReturnPercentage(totalProfitLoss, totalInvested) : 0,
    remainingFunds: Math.round(remainingFunds * 100) / 100,
    investmentProgress: budget.funds > 0 ? Math.round((totalInvested / budget.funds) * 100) : 0
  };
};