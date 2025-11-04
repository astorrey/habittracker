import { AtBat, HitType } from '../types';

export const calculateBattingAverage = (hits: number, atBats: number): number => {
  if (atBats === 0) return 0;
  return Number((hits / atBats).toFixed(3));
};

export const calculateOnBasePercentage = (
  hits: number,
  walks: number,
  hitByPitch: number,
  atBats: number,
  sacrificeFlies: number
): number => {
  const numerator = hits + walks + hitByPitch;
  const denominator = atBats + walks + hitByPitch + sacrificeFlies;
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(3));
};

export const calculateSluggingPercentage = (atBats: AtBat[]): number => {
  const totalAtBats = atBats.filter(ab => 
    ab.hit_type !== 'walk' && ab.hit_type !== 'hit_by_pitch'
  ).length;
  
  if (totalAtBats === 0) return 0;

  const totalBases = atBats.reduce((sum, ab) => {
    switch (ab.hit_type) {
      case 'single':
        return sum + 1;
      case 'double':
        return sum + 2;
      case 'triple':
        return sum + 3;
      case 'homerun':
        return sum + 4;
      default:
        return sum;
    }
  }, 0);

  return Number((totalBases / totalAtBats).toFixed(3));
};

export const getBasesReached = (hitType: HitType): number => {
  switch (hitType) {
    case 'single':
      return 1;
    case 'double':
      return 2;
    case 'triple':
      return 3;
    case 'homerun':
      return 4;
    case 'walk':
      return 1;
    default:
      return 0;
  }
};

