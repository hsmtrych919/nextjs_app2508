/**
 * フォーメーション定義
 */

import type { FormationType } from './types';

export const FORMATION_DEFINITIONS: FormationType[] = [
  {
    id: 'satellite_basic',
    name: '基本サテライト',
    tiers: 3,
    percentages: [70, 20, 10]
  },
  {
    id: 'satellite_aggressive',
    name: 'アグレッシブサテライト',
    tiers: 4,
    percentages: [60, 25, 10, 5]
  },
  {
    id: 'satellite_conservative',
    name: '保守的サテライト',
    tiers: 2,
    percentages: [80, 20]
  }
];
