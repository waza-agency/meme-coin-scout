export interface Coin {
  pairAddress: string;
  baseToken: {
    name: string;
    symbol: string;
    address: string;
  };
  quoteToken: {
    name: string;
    symbol: string;
    address: string;
  };
  dexId: string;
  url: string;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: Array<{
      label: string;
      url: string;
    }>;
    socials?: Array<{
      type: string;
      url: string;
    }>;
  };
  marketCap?: number;
  fdv?: number;
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  priceUsd?: string;
  priceChange?: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  volume?: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  chainId?: string;
  holderCount?: number;
  contractAddress?: string;
  priceNative: string;
  txns: {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
}

export interface TokenData {
  address: string;
  symbol: string;
  name: string;
  blockchain: string;
  marketCap: number;
  volume24h: number;
  price: number;
  priceChange24h: number;
  liquidity: number;
  fdv: number;
  pairAddress: string;
  pairCreatedAt: number;
  dexId: string;
  chainId: string;
  baseToken: {
    name: string;
    symbol: string;
    address: string;
  };
  quoteToken: {
    name: string;
    symbol: string;
    address: string;
  };
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: Coin[];
}

export interface FilterCriteria {
  minMarketCap: number;
  maxMarketCap: number;
  minAge: number;
  maxAge: number;
  minLiquidity: number;
  maxLiquidity: number;
}

export type Blockchain = 'solana' | 'sui' | 'base' | 'tron';

export interface BlockchainConfig {
  name: string;
  chainId: string;
  quoteTokens: string[];
  displayName: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Social Mentions Types
export interface SocialMentionsData {
  current24h: number;
  previous24h: number;
  change: number;
  changePercent: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  totalReach: number;
  topMentions: Array<{
    platform: string;
    content: string;
    engagement: number;
    timestamp: number;
  }>;
}

export interface SocialMentionsIndicator {
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  current24h: number;
  label: string;
  color: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface WhaleTransaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: number;
  type: 'buy' | 'sell';
  price: number;
  blockchain: string;
}

export interface WhaleActivityData {
  last24h: {
    totalBuys: number;
    totalSells: number;
    netFlow: number;
    uniqueWhales: number;
    largestTransaction: number;
    transactions: WhaleTransaction[];
  };
  last7d: {
    totalBuys: number;
    totalSells: number;
    netFlow: number;
    uniqueWhales: number;
    avgDailyVolume: number;
  };
  topWallets: Array<{
    address: string;
    balance: number;
    percentage: number;
    isKnown: boolean;
    label?: string;
  }>;
  smartMoney: {
    following: number;
    recentActivity: boolean;
    confidence: number;
  };
}

export interface WhaleActivityIndicator {
  trend: 'bullish' | 'bearish' | 'neutral';
  activity: 'high' | 'medium' | 'low';
  netFlow24h: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  signals: string[];
  color: string;
  label: string;
}

// Import technical analysis types
export type {
  TechnicalData,
  RSIData,
  VolumeData,
  AccumulationData,
  MomentumData,
  TechnicalSignal
} from '../services/technical-analysis';

// Import holder analysis types
export type {
  HolderData,
  ConcentrationData,
  DistributionData,
  LiquidityRiskData,
  WhaleHolderData,
  HolderSignal
} from '../services/holder-analysis'; 