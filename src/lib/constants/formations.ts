/**
 * フォーメーション定義
 */

import type { FormationType } from './types';

export const FORMATION_DEFINITIONS: FormationType[] = [
  {
    id: 'satellite_basic',
    name: '3銘柄 50-30-20%型',
    tiers: 3,
    percentages: [70, 20, 10]
  },
  {
    id: 'satellite_aggressive',
    name: '4銘柄 35-30-20-15%型',
    tiers: 4,
    percentages: [60, 25, 10, 5]
  },
  {
    id: 'satellite_conservative',
    name: '5銘柄 30-25-20-15-10%型',
    tiers: 2,
    percentages: [80, 20]
  }
];
