import { Coin } from '../types';
import { RugCheckRiskData } from '../services/rugcheck';
import { SocialMentionsData, SocialMentionsIndicator } from '../types';
import { WhaleActivityData, WhaleActivityIndicator } from '../types';

export type RiskLevel = 'high' | 'medium' | 'low';
export type LiquidityLevel = 'high' | 'medium' | 'low';

export interface LiquidityIndicator {
  level: LiquidityLevel;
  value: number;
  label: string;
  color: string;
}

export interface RiskIndicator {
  level: RiskLevel;
  score: number;
  label: string;
  color: string;
  factors: {
    age: number;
    liquidity: number;
    marketCap: number;
    volume: number;
    rugcheck?: number;
  };
  rugCheckData?: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    holders: number;
    lpLocked: boolean;
    mintAuthority: boolean;
    freezeAuthority: boolean;
    risks: Array<{
      name: string;
      description: string;
      level: 'info' | 'warn' | 'danger';
      score: number;
    }>;
  };
}

/**
 * Calculate liquidity indicator based on available liquidity data
 */
export const calculateLiquidityIndicator = (coin: Coin): LiquidityIndicator => {
  const liquidityUsd = coin.liquidity?.usd || 0;
  
  let level: LiquidityLevel;
  let label: string;
  let color: string;
  
  if (liquidityUsd >= 100000) {
    level = 'high';
    label = 'High';
    color = 'text-green-500';
  } else if (liquidityUsd >= 10000) {
    level = 'medium';
    label = 'Medium';
    color = 'text-yellow-500';
  } else {
    level = 'low';
    label = 'Low';
    color = 'text-red-500';
  }
  
  return {
    level,
    value: liquidityUsd,
    label,
    color
  };
};

/**
 * Calculate social mentions indicator based on 24h activity
 */
export const calculateSocialMentionsIndicator = (
  socialData: SocialMentionsData | null
): SocialMentionsIndicator => {
  if (!socialData) {
    return {
      trend: 'stable',
      changePercent: 0,
      current24h: 0,
      label: 'No Data',
      color: 'text-gray-500',
      sentiment: 'neutral',
      confidence: 0,
    };
  }

  const { changePercent, current24h, sentiment } = socialData;
  
  // Determine trend based on change percentage (lowered thresholds)
  let trend: 'up' | 'down' | 'stable';
  let color: string;
  
  if (changePercent > 10) {
    trend = 'up';
    color = 'text-green-500';
  } else if (changePercent < -10) {
    trend = 'down';
    color = 'text-red-500';
  } else {
    trend = 'stable';
    color = 'text-yellow-500';
  }
  
  // Determine overall sentiment
  const totalSentiment = sentiment.positive + sentiment.negative + sentiment.neutral;
  let overallSentiment: 'positive' | 'negative' | 'neutral';
  
  if (totalSentiment === 0) {
    overallSentiment = 'neutral';
  } else if (sentiment.positive > sentiment.negative && sentiment.positive > sentiment.neutral) {
    overallSentiment = 'positive';
  } else if (sentiment.negative > sentiment.positive && sentiment.negative > sentiment.neutral) {
    overallSentiment = 'negative';
  } else {
    overallSentiment = 'neutral';
  }
  
  // Create more informative label based on mentions and sentiment
  let label: string;
  if (current24h === 0) {
    label = 'No Mentions';
  } else if (current24h === 1) {
    label = `1 mention (${overallSentiment})`;
  } else if (current24h < 10) {
    label = `${current24h} mentions (${overallSentiment})`;
  } else if (current24h < 50) {
    label = `${current24h} mentions (${overallSentiment})`;
  } else {
    label = `${current24h}+ mentions (${overallSentiment})`;
  }
  
  // Calculate confidence based on number of mentions
  let confidence: number;
  if (current24h >= 50) {
    confidence = 100;
  } else if (current24h >= 20) {
    confidence = 80;
  } else if (current24h >= 10) {
    confidence = 60;
  } else if (current24h >= 5) {
    confidence = 40;
  } else {
    confidence = 20;
  }
  
  return {
    trend,
    changePercent,
    current24h,
    label,
    color,
    sentiment: overallSentiment,
    confidence,
  };
};

/**
 * Calculate risk factor based on multiple indicators
 */
export const calculateRiskIndicator = (coin: Coin, rugCheckData?: RugCheckRiskData): RiskIndicator => {
  const liquidityUsd = coin.liquidity?.usd || 0;
  const marketCap = coin.marketCap || coin.fdv || 0;
  const volume24h = coin.volume?.h24 || 0;
  const age = calculateAge(coin.pairCreatedAt);
  
  // Calculate individual risk factors (0-100, where 100 is highest risk)
  const factors = {
    age: calculateAgeRisk(age),
    liquidity: calculateLiquidityRisk(liquidityUsd),
    marketCap: calculateMarketCapRisk(marketCap),
    volume: calculateVolumeRisk(volume24h, liquidityUsd),
    rugcheck: rugCheckData ? calculateRugCheckRisk(rugCheckData) : undefined
  };
  
  // Weighted average of risk factors (adjust weights based on rugcheck availability)
  const totalScore = rugCheckData ? (
    factors.age * 0.2 +
    factors.liquidity * 0.2 +
    factors.marketCap * 0.15 +
    factors.volume * 0.15 +
    factors.rugcheck! * 0.3  // Give rugcheck data highest weight
  ) : (
    factors.age * 0.3 +
    factors.liquidity * 0.3 +
    factors.marketCap * 0.2 +
    factors.volume * 0.2
  );
  
  let level: RiskLevel;
  let label: string;
  let color: string;
  
  if (totalScore >= 70) {
    level = 'high';
    label = 'High Risk';
    color = 'text-red-500';
  } else if (totalScore >= 40) {
    level = 'medium';
    label = 'Medium Risk';
    color = 'text-yellow-500';
  } else {
    level = 'low';
    label = 'Low Risk';
    color = 'text-green-500';
  }
  
  return {
    level,
    score: Math.round(totalScore),
    label,
    color,
    factors,
    rugCheckData: rugCheckData ? {
      riskScore: rugCheckData.riskScore,
      riskLevel: rugCheckData.riskLevel,
      holders: rugCheckData.holders,
      lpLocked: rugCheckData.lpLocked,
      mintAuthority: rugCheckData.mintAuthority,
      freezeAuthority: rugCheckData.freezeAuthority,
      risks: rugCheckData.risks
    } : undefined
  };
};

/**
 * Calculate age-based risk (newer = higher risk)
 */
const calculateAgeRisk = (ageInDays: number): number => {
  if (ageInDays < 1) return 100;
  if (ageInDays < 3) return 90;
  if (ageInDays < 7) return 75;
  if (ageInDays < 30) return 50;
  if (ageInDays < 90) return 25;
  return 10;
};

/**
 * Calculate liquidity-based risk (lower liquidity = higher risk)
 */
const calculateLiquidityRisk = (liquidityUsd: number): number => {
  if (liquidityUsd < 1000) return 100;
  if (liquidityUsd < 5000) return 90;
  if (liquidityUsd < 10000) return 75;
  if (liquidityUsd < 50000) return 50;
  if (liquidityUsd < 100000) return 25;
  return 10;
};

/**
 * Calculate market cap-based risk (smaller = higher risk)
 */
const calculateMarketCapRisk = (marketCap: number): number => {
  if (marketCap < 10000) return 100;
  if (marketCap < 50000) return 90;
  if (marketCap < 100000) return 75;
  if (marketCap < 1000000) return 50;
  if (marketCap < 10000000) return 25;
  return 10;
};

/**
 * Calculate volume-based risk (low volume relative to liquidity = higher risk)
 */
const calculateVolumeRisk = (volume24h: number, liquidityUsd: number): number => {
  if (liquidityUsd === 0) return 100;
  
  const volumeToLiquidityRatio = volume24h / liquidityUsd;
  
  if (volumeToLiquidityRatio < 0.01) return 100;
  if (volumeToLiquidityRatio < 0.05) return 75;
  if (volumeToLiquidityRatio < 0.1) return 50;
  if (volumeToLiquidityRatio < 0.3) return 25;
  return 10;
};

/**
 * Calculate rugcheck-based risk (uses rugcheck.xyz API data)
 */
const calculateRugCheckRisk = (rugCheckData: RugCheckRiskData): number => {
  let riskScore = 0;
  
  // Base risk from rugcheck API score (0-100)
  riskScore += rugCheckData.riskScore;
  
  // Additional penalties for specific risks
  if (rugCheckData.mintAuthority) {
    riskScore += 20; // Mint authority is a significant risk
  }
  
  if (rugCheckData.freezeAuthority) {
    riskScore += 15; // Freeze authority is also risky
  }
  
  if (!rugCheckData.lpLocked || rugCheckData.lpLockedPct < 50) {
    riskScore += 25; // Unlocked liquidity is very risky
  }
  
  if (rugCheckData.topHoldersPct > 50) {
    riskScore += 20; // High concentration in top holders
  }
  
  if (rugCheckData.holders < 100) {
    riskScore += 15; // Very few holders
  }
  
  // Count high-severity risks
  const dangerRisks = rugCheckData.risks.filter(r => r.level === 'danger').length;
  const warnRisks = rugCheckData.risks.filter(r => r.level === 'warn').length;
  
  riskScore += dangerRisks * 10;
  riskScore += warnRisks * 5;
  
  // Cap at 100
  return Math.min(riskScore, 100);
};

/**
 * Calculate age from timestamp (imported from filters.ts)
 */
const calculateAge = (pairCreatedAt: number): number => {
  try {
    let createdDate: Date;
    
    if (pairCreatedAt > 1000000000000) {
      createdDate = new Date(pairCreatedAt);
    } else {
      createdDate = new Date(pairCreatedAt * 1000);
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, Math.min(diffDays, 10000));
  } catch (error) {
    return 0;
  }
};

/**
 * Format liquidity value for display
 */
export const formatLiquidity = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
};

/**
 * Format social mentions change for display
 */
export const formatSocialMentionsChange = (changePercent: number): string => {
  const sign = changePercent > 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(1)}%`;
};

export function calculateWhaleActivityIndicator(data: WhaleActivityData): WhaleActivityIndicator {
  const { last24h, last7d, smartMoney } = data;
  
  // Calculate trend based on net flow (lowered thresholds for better sensitivity)
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (last24h.netFlow > 10000) trend = 'bullish';      // $10k+ (was $50k+)
  else if (last24h.netFlow < -10000) trend = 'bearish'; // -$10k+ (was -$50k+)
  
  // Calculate activity level (lowered thresholds for broader token range)
  let activity: 'high' | 'medium' | 'low' = 'low';
  const totalVolume = last24h.totalBuys + last24h.totalSells;
  if (totalVolume > 100000) activity = 'high';         // $100k+ (was $500k+)
  else if (totalVolume > 25000) activity = 'medium';   // $25k+ (was $100k+)
  
  // Calculate confidence based on multiple factors (more generous scoring)
  let confidence = 0;
  confidence += Math.min(last24h.uniqueWhales * 15, 45); // Up to 45 points for whale count (more generous)
  confidence += Math.min(totalVolume / 5000, 35);        // Up to 35 points for volume (lower threshold)
  confidence += smartMoney.confidence * 0.2;             // Up to 20 points for smart money
  confidence = Math.min(Math.floor(confidence), 100);
  
  // Determine risk level (adjusted thresholds)
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (last24h.netFlow < -50000) riskLevel = 'high';      // -$50k+ (was -$200k+)
  else if (last24h.netFlow < -15000) riskLevel = 'medium'; // -$15k+ (was -$50k+)
  
  // Generate signals (lowered thresholds for more frequent signals)
  const signals: string[] = [];
  if (last24h.netFlow > 25000) signals.push('Strong accumulation');        // $25k+ (was $100k+)
  if (last24h.netFlow < -25000) signals.push('Heavy selling');            // -$25k+ (was -$100k+)
  if (last24h.uniqueWhales > 5) signals.push('High whale interest');      // 5+ whales (was 10+)
  if (smartMoney.following > 1) signals.push('Smart money following');    // 1+ (was 2+)
  if (smartMoney.recentActivity) signals.push('Recent smart money activity');
  if (last24h.largestTransaction > 50000) signals.push('Large transaction detected'); // $50k+ (was $200k+)
  
  // Additional signals for smaller activity levels
  if (last24h.netFlow > 5000 && last24h.netFlow <= 25000) signals.push('Moderate accumulation');
  if (last24h.uniqueWhales >= 3 && last24h.uniqueWhales <= 5) signals.push('Moderate whale interest');
  if (totalVolume > 10000 && totalVolume <= 25000) signals.push('Active trading');
  
  // Determine color
  let color = '#6b7280'; // neutral gray
  if (trend === 'bullish') color = '#10b981'; // green
  else if (trend === 'bearish') color = '#ef4444'; // red
  
  // Create label
  const label = `${formatWhaleNetFlow(last24h.netFlow)} (${last24h.uniqueWhales} whales)`;
  
  return {
    trend,
    activity,
    netFlow24h: last24h.netFlow,
    confidence,
    riskLevel,
    signals,
    color,
    label,
  };
}

export function formatWhaleNetFlow(netFlow: number): string {
  const absFlow = Math.abs(netFlow);
  const sign = netFlow >= 0 ? '+' : '-';
  
  if (absFlow >= 1000000) {
    return `${sign}$${(absFlow / 1000000).toFixed(1)}M`;
  } else if (absFlow >= 1000) {
    return `${sign}$${(absFlow / 1000).toFixed(1)}K`;
  } else {
    return `${sign}$${absFlow.toFixed(0)}`;
  }
}

export function getWhaleActivityColor(trend: 'bullish' | 'bearish' | 'neutral'): string {
  switch (trend) {
    case 'bullish': return '#10b981';
    case 'bearish': return '#ef4444';
    case 'neutral': return '#6b7280';
  }
}

export function getWhaleActivityEmoji(trend: 'bullish' | 'bearish' | 'neutral'): string {
  switch (trend) {
    case 'bullish': return '🐋📈';
    case 'bearish': return '🐋📉';
    case 'neutral': return '🐋➡️';
  }
} 