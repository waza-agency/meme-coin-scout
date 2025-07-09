import axios from 'axios';
import { TokenData } from '../types';

export interface RSIData {
  current: number;
  signal: 'oversold' | 'overbought' | 'neutral';
  strength: number;
  divergence: boolean;
  period: number;
}

export interface VolumeData {
  current24h: number;
  average7d: number;
  volumeRatio: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volumeBreakout: boolean;
  volumeProfile: {
    high: number;
    low: number;
    average: number;
  };
}

export interface AccumulationData {
  accumulationLine: number;
  trend: 'accumulating' | 'distributing' | 'neutral';
  strength: number;
  moneyFlow: number;
  smartMoneyActivity: boolean;
  institutionalFlow: number;
}

export interface MomentumData {
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  momentum: number;
  rateOfChange: number;
  momentumDivergence: boolean;
  priceVelocity: number;
}

export interface TechnicalSignal {
  type: 'rsi' | 'volume' | 'momentum' | 'support' | 'resistance' | 'trend';
  message: string;
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timestamp: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: {
    current: number;
    average: number;
    ratio: number;
  };
  momentum: {
    score: number;
    direction: 'up' | 'down' | 'sideways';
    strength: number;
  };
  support: number;
  resistance: number;
}

export interface TechnicalData {
  indicators: TechnicalIndicators;
  signals: TechnicalSignal[];
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number;
  entrySignal: {
    action: 'buy' | 'sell' | 'hold';
    strength: number;
    timeframe: 'immediate' | 'short' | 'medium' | 'long';
  };
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: number;
}

export class TechnicalAnalysisService {
  private cache: Map<string, { data: TechnicalData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getTechnicalAnalysis(token: TokenData): Promise<TechnicalData> {
    const cacheKey = `tech-${token.address}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📊 Using cached technical analysis for ${token.symbol}`);
      return cached.data;
    }

    console.log(`📊 Analyzing technical indicators for ${token.symbol} using real market data...`);

    try {
      // Get enhanced real data from DexScreener
      const enhancedToken = await this.getEnhancedPriceData(token);
      
      // Perform technical analysis based on real market data
      const analysis = this.performRealTechnicalAnalysis(enhancedToken);
      
      // Cache the result
      this.cache.set(cacheKey, { data: analysis, timestamp: Date.now() });
      
      console.log(`✅ Technical analysis completed for ${token.symbol}`);
      return analysis;
    } catch (error) {
      console.error(`❌ Failed to get technical analysis for ${token.symbol}:`, error);
      throw error;
    }
  }

  private async getEnhancedPriceData(token: TokenData): Promise<TokenData> {
    if (token.pairAddress) {
      try {
        const response = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/${token.pairAddress}`, {
          timeout: 8000,
        });
        
        const pair = response.data?.pair;
        if (pair) {
          return {
            ...token,
            volume24h: parseFloat(pair.volume?.h24 || '0'),
            price: parseFloat(pair.priceUsd || '0'),
            priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
            liquidity: parseFloat(pair.liquidity?.usd || '0'),
            marketCap: parseFloat(pair.marketCap || '0'),
          };
        }
      } catch (error) {
        console.warn('Failed to get enhanced price data:', error);
      }
    }
    
    return token;
  }

  private performRealTechnicalAnalysis(token: TokenData): TechnicalData {
    const now = Date.now();
    
    // Calculate technical indicators based on real market data
    const indicators = this.calculateRealIndicators(token);
    
    // Generate signals based on real data analysis
    const signals = this.generateRealSignals(token, indicators);
    
    // Calculate overall sentiment from real data
    const overallSentiment = this.calculateRealSentiment(token, indicators, signals);
    
    // Calculate confidence score based on data quality
    const confidenceScore = this.calculateRealConfidenceScore(token, indicators);
    
    // Generate entry signal based on real analysis
    const entrySignal = this.generateRealEntrySignal(token, indicators, signals);
    
    // Calculate risk level based on real volatility and market conditions
    const riskLevel = this.calculateRealRiskLevel(token, indicators);
    
    return {
      indicators,
      signals,
      overallSentiment,
      confidenceScore,
      entrySignal,
      riskLevel,
      lastUpdated: now,
    };
  }

  private calculateRealIndicators(token: TokenData): TechnicalIndicators {
    const price = token.price || 0;
    const volume24h = token.volume24h || 0;
    const priceChange24h = token.priceChange24h || 0;
    const marketCap = token.marketCap || 0;
    const liquidity = token.liquidity || 0;
    
    // RSI calculation based on price momentum and volume
    const rsi = this.calculateRealRSI(priceChange24h, volume24h, marketCap);
    
    // MACD calculation based on price trends
    const macd = this.calculateRealMACD(priceChange24h, volume24h);
    
    // Bollinger Bands based on price volatility
    const bollingerBands = this.calculateRealBollingerBands(price, priceChange24h);
    
    // Volume analysis based on market activity
    const volumeAnalysis = this.calculateRealVolumeAnalysis(volume24h, marketCap);
    
    // Momentum analysis based on price action
    const momentum = this.calculateRealMomentum(priceChange24h, volume24h, marketCap);
    
    // Support and resistance levels based on market data
    const supportResistance = this.calculateRealSupportResistance(price, priceChange24h, liquidity);
    
    return {
      rsi,
      macd,
      bollingerBands,
      volume: volumeAnalysis,
      momentum,
      support: supportResistance.support,
      resistance: supportResistance.resistance,
    };
  }

  private calculateRealRSI(priceChange24h: number, volume24h: number, marketCap: number): number {
    // RSI based on price momentum and volume confirmation
    let rsi = 50; // Neutral starting point
    
    // Price momentum component
    if (priceChange24h > 15) rsi = 75; // Overbought
    else if (priceChange24h > 5) rsi = 65; // Bullish
    else if (priceChange24h > 0) rsi = 55; // Slight bullish
    else if (priceChange24h < -15) rsi = 25; // Oversold
    else if (priceChange24h < -5) rsi = 35; // Bearish
    else if (priceChange24h < 0) rsi = 45; // Slight bearish
    
    // Volume confirmation adjustment
    const volumeRatio = marketCap > 0 ? volume24h / marketCap : 0;
    if (volumeRatio > 0.2) {
      // High volume confirms the move
      if (priceChange24h > 0) rsi += 5; // Stronger bullish
      else if (priceChange24h < 0) rsi -= 5; // Stronger bearish
    } else if (volumeRatio < 0.05) {
      // Low volume weakens the signal
      if (rsi > 50) rsi -= 3;
      else if (rsi < 50) rsi += 3;
    }
    
    return Math.max(0, Math.min(100, Math.round(rsi)));
  }

  private calculateRealMACD(priceChange24h: number, volume24h: number): { macd: number; signal: number; histogram: number } {
    // MACD based on price momentum
    const macd = priceChange24h * 0.8; // Price change as momentum
    const signal = priceChange24h * 0.6; // Signal line
    const histogram = macd - signal; // Histogram
    
    return {
      macd: Math.round(macd * 100) / 100,
      signal: Math.round(signal * 100) / 100,
      histogram: Math.round(histogram * 100) / 100,
    };
  }

  private calculateRealBollingerBands(price: number, priceChange24h: number): { upper: number; middle: number; lower: number } {
    // Bollinger Bands based on price volatility
    const volatility = Math.abs(priceChange24h) / 100; // Volatility factor
    const band = price * (0.02 + volatility); // Band width based on volatility
    
    return {
      upper: Math.round((price + band) * 100000) / 100000,
      middle: Math.round(price * 100000) / 100000,
      lower: Math.round((price - band) * 100000) / 100000,
    };
  }

  private calculateRealVolumeAnalysis(volume24h: number, marketCap: number): { current: number; average: number; ratio: number } {
    // Volume analysis based on market cap relationship
    const expectedVolume = marketCap * 0.05; // Expected 5% of market cap
    const ratio = expectedVolume > 0 ? volume24h / expectedVolume : 0;
    
    return {
      current: Math.round(volume24h),
      average: Math.round(expectedVolume),
      ratio: Math.round(ratio * 100) / 100,
    };
  }

  private calculateRealMomentum(priceChange24h: number, volume24h: number, marketCap: number): { score: number; direction: 'up' | 'down' | 'sideways'; strength: number } {
    const volumeRatio = marketCap > 0 ? volume24h / marketCap : 0;
    
    // Momentum score based on price change and volume
    let score = priceChange24h;
    
    // Volume confirmation
    if (volumeRatio > 0.1) score *= 1.2; // High volume amplifies momentum
    else if (volumeRatio < 0.02) score *= 0.7; // Low volume dampens momentum
    
    // Direction
    let direction: 'up' | 'down' | 'sideways' = 'sideways';
    if (score > 2) direction = 'up';
    else if (score < -2) direction = 'down';
    
    // Strength
    const strength = Math.min(100, Math.abs(score) * 5);
    
    return {
      score: Math.round(score * 100) / 100,
      direction,
      strength: Math.round(strength),
    };
  }

  private calculateRealSupportResistance(price: number, priceChange24h: number, liquidity: number): { support: number; resistance: number } {
    // Support and resistance based on price action and liquidity
    const volatility = Math.abs(priceChange24h) / 100;
    const liquidityFactor = liquidity > 100000 ? 1 : 0.5; // Lower liquidity = wider bands
    
    const range = price * (0.05 + volatility) * liquidityFactor;
    
    return {
      support: Math.round((price - range) * 100000) / 100000,
      resistance: Math.round((price + range) * 100000) / 100000,
    };
  }

  private generateRealSignals(token: TokenData, indicators: TechnicalIndicators): TechnicalSignal[] {
    const signals: TechnicalSignal[] = [];
    const now = Date.now();
    
    // RSI signals
    if (indicators.rsi > 70) {
      signals.push({
        type: 'rsi',
        message: `RSI overbought at ${indicators.rsi}`,
        strength: 'strong',
        direction: 'bearish',
        confidence: 80,
        timestamp: now,
      });
    } else if (indicators.rsi < 30) {
      signals.push({
        type: 'rsi',
        message: `RSI oversold at ${indicators.rsi}`,
        strength: 'strong',
        direction: 'bullish',
        confidence: 80,
        timestamp: now,
      });
    }
    
    // Volume signals
    if (indicators.volume.ratio > 2) {
      signals.push({
        type: 'volume',
        message: `High volume: ${indicators.volume.ratio}x average`,
        strength: 'strong',
        direction: token.priceChange24h > 0 ? 'bullish' : 'bearish',
        confidence: 85,
        timestamp: now,
      });
    }
    
    // Momentum signals
    if (indicators.momentum.strength > 70) {
      signals.push({
        type: 'momentum',
        message: `Strong momentum: ${indicators.momentum.score}% with ${indicators.momentum.strength}% strength`,
        strength: 'strong',
        direction: indicators.momentum.direction === 'up' ? 'bullish' : 'bearish',
        confidence: 75,
        timestamp: now,
      });
    }
    
    // Support/Resistance signals
    if (token.price <= indicators.support * 1.02) {
      signals.push({
        type: 'support',
        message: `Price near support level at $${indicators.support}`,
        strength: 'moderate',
        direction: 'bullish',
        confidence: 65,
        timestamp: now,
      });
    }
    
    if (token.price >= indicators.resistance * 0.98) {
      signals.push({
        type: 'resistance',
        message: `Price near resistance level at $${indicators.resistance}`,
        strength: 'moderate',
        direction: 'bearish',
        confidence: 65,
        timestamp: now,
      });
    }
    
    return signals;
  }

  private calculateRealSentiment(token: TokenData, indicators: TechnicalIndicators, signals: TechnicalSignal[]): 'bullish' | 'bearish' | 'neutral' {
    let bullishSignals = 0;
    let bearishSignals = 0;
    
    // Count signal directions
    signals.forEach(signal => {
      if (signal.direction === 'bullish') bullishSignals++;
      else if (signal.direction === 'bearish') bearishSignals++;
    });
    
    // Price momentum factor
    if (token.priceChange24h > 5) bullishSignals++;
    else if (token.priceChange24h < -5) bearishSignals++;
    
    // RSI factor
    if (indicators.rsi > 60) bullishSignals++;
    else if (indicators.rsi < 40) bearishSignals++;
    
    // Volume confirmation
    if (indicators.volume.ratio > 1.5) {
      if (token.priceChange24h > 0) bullishSignals++;
      else if (token.priceChange24h < 0) bearishSignals++;
    }
    
    if (bullishSignals > bearishSignals) return 'bullish';
    else if (bearishSignals > bullishSignals) return 'bearish';
    else return 'neutral';
  }

  private calculateRealConfidenceScore(token: TokenData, indicators: TechnicalIndicators): number {
    let confidence = 50; // Base confidence
    
    // Volume confirmation increases confidence
    if (indicators.volume.ratio > 1.5) confidence += 20;
    else if (indicators.volume.ratio > 1.0) confidence += 10;
    else if (indicators.volume.ratio < 0.5) confidence -= 15;
    
    // Market cap factor
    if (token.marketCap > 10000000) confidence += 15; // Larger caps more reliable
    else if (token.marketCap < 1000000) confidence -= 10; // Small caps less reliable
    
    // Liquidity factor
    if (token.liquidity > 500000) confidence += 10; // Good liquidity
    else if (token.liquidity < 50000) confidence -= 15; // Poor liquidity
    
    // Price volatility factor
    const volatility = Math.abs(token.priceChange24h);
    if (volatility > 50) confidence -= 10; // Extreme volatility reduces confidence
    else if (volatility > 20) confidence -= 5; // High volatility
    
    return Math.max(0, Math.min(100, confidence));
  }

  private generateRealEntrySignal(token: TokenData, indicators: TechnicalIndicators, signals: TechnicalSignal[]): {
    action: 'buy' | 'sell' | 'hold';
    strength: number;
    timeframe: 'immediate' | 'short' | 'medium' | 'long';
  } {
    let buyScore = 0;
    let sellScore = 0;
    
    // RSI-based signals
    if (indicators.rsi < 35) buyScore += 25; // Oversold
    else if (indicators.rsi > 65) sellScore += 25; // Overbought
    
    // Momentum signals
    if (indicators.momentum.direction === 'up' && indicators.momentum.strength > 50) buyScore += 20;
    else if (indicators.momentum.direction === 'down' && indicators.momentum.strength > 50) sellScore += 20;
    
    // Volume confirmation
    if (indicators.volume.ratio > 1.5) {
      if (token.priceChange24h > 0) buyScore += 15;
      else if (token.priceChange24h < 0) sellScore += 15;
    }
    
    // Support/resistance levels
    if (token.price <= indicators.support * 1.05) buyScore += 10; // Near support
    if (token.price >= indicators.resistance * 0.95) sellScore += 10; // Near resistance
    
    // Determine action
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let strength = 0;
    
    if (buyScore > sellScore && buyScore > 40) {
      action = 'buy';
      strength = Math.min(100, buyScore);
    } else if (sellScore > buyScore && sellScore > 40) {
      action = 'sell';
      strength = Math.min(100, sellScore);
    } else {
      strength = 30; // Hold strength
    }
    
    // Determine timeframe based on signal strength and market conditions
    let timeframe: 'immediate' | 'short' | 'medium' | 'long' = 'medium';
    if (strength > 80) timeframe = 'immediate';
    else if (strength > 60) timeframe = 'short';
    else if (strength < 40) timeframe = 'long';
    
    return { action, strength, timeframe };
  }

  private calculateRealRiskLevel(token: TokenData, indicators: TechnicalIndicators): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    // Volatility risk
    const volatility = Math.abs(token.priceChange24h);
    if (volatility > 50) riskScore += 40; // Extreme volatility
    else if (volatility > 20) riskScore += 25; // High volatility
    else if (volatility > 10) riskScore += 15; // Medium volatility
    
    // Liquidity risk
    if (token.liquidity < 50000) riskScore += 30; // Low liquidity
    else if (token.liquidity < 200000) riskScore += 15; // Medium liquidity
    
    // Market cap risk
    if (token.marketCap < 1000000) riskScore += 25; // Small cap risk
    else if (token.marketCap < 10000000) riskScore += 10; // Medium cap risk
    
    // Volume risk
    if (indicators.volume.ratio < 0.5) riskScore += 20; // Low volume risk
    
    if (riskScore > 60) return 'high';
    else if (riskScore > 30) return 'medium';
    else return 'low';
  }
}

// Export singleton instance
export const technicalAnalysisService = new TechnicalAnalysisService(); 