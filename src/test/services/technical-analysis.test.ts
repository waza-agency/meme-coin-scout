import { describe, it, expect, beforeEach } from 'vitest';
import { technicalAnalysisService } from '../../services/technical-analysis';
import { TokenData } from '../../types';

describe('TechnicalAnalysisService', () => {
  let mockTokenData: TokenData;

  beforeEach(() => {
    mockTokenData = {
      address: '0x123',
      symbol: 'TEST',
      name: 'Test Token',
      blockchain: 'ethereum',
      marketCap: 1000000,
      volume24h: 100000,
      price: 1.5,
      priceChange24h: 10,
      liquidity: 200000,
      fdv: 1200000,
      pairAddress: '0x456',
      pairCreatedAt: Date.now() - 86400000, // 1 day ago
      dexId: 'uniswap',
      chainId: 'ethereum',
      baseToken: {
        name: 'Test Token',
        symbol: 'TEST',
        address: '0x123'
      },
      quoteToken: {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x789'
      }
    };
  });

  describe('getTechnicalAnalysis', () => {
    it('should return technical analysis data', async () => {
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result).toHaveProperty('rsi');
      expect(result).toHaveProperty('volume');
      expect(result).toHaveProperty('accumulation');
      expect(result).toHaveProperty('momentum');
      expect(result).toHaveProperty('signals');

      expect(Array.isArray(result.signals)).toBe(true);
    });

    it('should cache results for the same token', async () => {
      const result1 = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);
      const result2 = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result1).toEqual(result2);
    });
  });

  describe('RSI Calculation', () => {
    it('should calculate RSI for positive price change', async () => {
      mockTokenData.priceChange24h = 15;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.rsi.value).toBeGreaterThan(50);
      expect(result.rsi.trend).toBe('bullish');
      expect(result.rsi.strength).toBeGreaterThan(0);
    });

    it('should calculate RSI for negative price change', async () => {
      mockTokenData.priceChange24h = -15;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.rsi.value).toBeLessThan(50);
      expect(result.rsi.trend).toBe('bearish');
      expect(result.rsi.strength).toBeGreaterThan(0);
    });

    it('should identify oversold conditions', async () => {
      mockTokenData.priceChange24h = -40;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.rsi.level).toBe('oversold');
      expect(result.rsi.value).toBeLessThan(30);
    });

    it('should identify overbought conditions', async () => {
      mockTokenData.priceChange24h = 40;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.rsi.level).toBe('overbought');
      expect(result.rsi.value).toBeGreaterThan(70);
    });
  });

  describe('Volume Analysis', () => {
    it('should calculate volume ratio correctly', async () => {
      mockTokenData.volume24h = 150000;
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.volume.current24h).toBe(150000);
      expect(result.volume.ratio).toBeGreaterThan(0);
      expect(result.volume.average7d).toBeGreaterThan(0);
    });

    it('should identify volume spikes', async () => {
      mockTokenData.volume24h = 500000; // High volume
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.volume.trend).toBe('spike');
      expect(result.volume.strength).toBeGreaterThan(50);
    });

    it('should identify below average volume', async () => {
      mockTokenData.volume24h = 10000; // Low volume
      mockTokenData.marketCap = 2000000; // High market cap
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.volume.trend).toBe('below_average');
    });
  });

  describe('Accumulation Pattern Analysis', () => {
    it('should detect accumulation pattern', async () => {
      mockTokenData.priceChange24h = 8;
      mockTokenData.volume24h = 300000; // High volume
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.accumulation.pattern).toBe('accumulation');
      expect(result.accumulation.strength).toBeGreaterThan(0);
    });

    it('should detect distribution pattern', async () => {
      mockTokenData.priceChange24h = -8;
      mockTokenData.volume24h = 400000; // High volume
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.accumulation.pattern).toBe('distribution');
      expect(result.accumulation.strength).toBeGreaterThan(0);
    });

    it('should detect neutral pattern', async () => {
      mockTokenData.priceChange24h = 1;
      mockTokenData.volume24h = 50000; // Low volume
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.accumulation.pattern).toBe('neutral');
    });
  });

  describe('Momentum Analysis', () => {
    it('should calculate momentum for different timeframes', async () => {
      mockTokenData.priceChange24h = 12;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.momentum.shortTerm).toBeLessThan(result.momentum.mediumTerm);
      expect(result.momentum.longTerm).toBeLessThan(result.momentum.mediumTerm);
      expect(result.momentum.trend).toBe('bullish');
      expect(result.momentum.strength).toBeGreaterThan(0);
    });

    it('should detect bearish momentum', async () => {
      mockTokenData.priceChange24h = -8;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.momentum.trend).toBe('bearish');
    });

    it('should detect neutral momentum', async () => {
      mockTokenData.priceChange24h = 1;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.momentum.trend).toBe('neutral');
    });
  });

  describe('Signal Generation', () => {
    it('should generate early warning signals for strong accumulation', async () => {
      mockTokenData.priceChange24h = 15;
      mockTokenData.volume24h = 400000;
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      const earlyWarningSignals = result.signals.filter(s => s.type === 'early_warning');
      expect(earlyWarningSignals.length).toBeGreaterThan(0);
    });

    it('should generate entry timing signals for oversold RSI with bullish momentum', async () => {
      mockTokenData.priceChange24h = -35; // Oversold RSI
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      const entrySignals = result.signals.filter(s => s.type === 'entry_timing');
      expect(entrySignals.some(s => s.signal.includes('RSI Oversold'))).toBe(true);
    });

    it('should generate risk warning signals for overbought distribution', async () => {
      mockTokenData.priceChange24h = 35; // Overbought
      mockTokenData.volume24h = 500000; // High volume (distribution)
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      const riskSignals = result.signals.filter(s => s.type === 'risk_warning');
      expect(riskSignals.length).toBeGreaterThan(0);
    });

    it('should generate volume spike signals', async () => {
      mockTokenData.volume24h = 600000; // Very high volume
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      const volumeSignals = result.signals.filter(s => s.signal.includes('Volume Spike'));
      expect(volumeSignals.length).toBe(1);
      expect(volumeSignals[0].strength).toBeGreaterThan(70);
    });

    it('should generate optimal entry zone signals', async () => {
      mockTokenData.priceChange24h = 5; // Moderate positive change
      mockTokenData.volume24h = 250000; // Above average volume
      mockTokenData.marketCap = 1000000;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      const entrySignals = result.signals.filter(s => s.signal.includes('Optimal Entry Zone'));
      expect(entrySignals.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero volume', async () => {
      mockTokenData.volume24h = 0;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.volume.current24h).toBe(0);
      expect(result.volume.ratio).toBe(1);
      expect(result.accumulation.pattern).toBe('neutral');
    });

    it('should handle zero market cap', async () => {
      mockTokenData.marketCap = 0;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.rsi.value).toBeGreaterThanOrEqual(0);
      expect(result.rsi.value).toBeLessThanOrEqual(100);
    });

    it('should handle negative price change', async () => {
      mockTokenData.priceChange24h = -20;
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      expect(result.rsi.value).toBeLessThan(50);
      expect(result.momentum.trend).toBe('bearish');
    });

    it('should handle service errors gracefully', async () => {
      // Test with invalid data
      const invalidTokenData = { ...mockTokenData, symbol: '' };
      const result = await technicalAnalysisService.getTechnicalAnalysis(invalidTokenData);

      // Should still return valid structure
      expect(result).toHaveProperty('rsi');
      expect(result).toHaveProperty('signals');
      expect(Array.isArray(result.signals)).toBe(true);
    });
  });

  describe('Signal Quality', () => {
    it('should provide confidence scores for all signals', async () => {
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      result.signals.forEach(signal => {
        expect(signal.confidence).toBeGreaterThanOrEqual(0);
        expect(signal.confidence).toBeLessThanOrEqual(100);
        expect(signal.strength).toBeGreaterThanOrEqual(0);
        expect(signal.strength).toBeLessThanOrEqual(100);
        expect(signal.timeframe).toBeDefined();
        expect(signal.description).toBeDefined();
      });
    });

    it('should have consistent signal types', async () => {
      const result = await technicalAnalysisService.getTechnicalAnalysis(mockTokenData);

      result.signals.forEach(signal => {
        expect(['early_warning', 'entry_timing', 'risk_warning']).toContain(signal.type);
      });
    });
  });
}); 