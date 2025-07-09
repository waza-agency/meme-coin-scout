import { describe, it, expect, beforeEach } from 'vitest';
import { holderAnalysisService } from '../../services/holder-analysis';
import { TokenData } from '../../types';

describe('HolderAnalysisService', () => {
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
      priceChange24h: 5,
      liquidity: 200000,
      fdv: 1200000,
      pairAddress: '0x456',
      pairCreatedAt: Date.now() - 86400000 * 30, // 30 days ago
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

  describe('getHolderAnalysis', () => {
    it('should return holder analysis data', async () => {
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result).toHaveProperty('concentration');
      expect(result).toHaveProperty('distribution');
      expect(result).toHaveProperty('liquidityRisk');
      expect(result).toHaveProperty('whaleHolders');
      expect(result).toHaveProperty('signals');

      expect(Array.isArray(result.signals)).toBe(true);
    });

    it('should cache results for the same token', async () => {
      const result1 = await holderAnalysisService.getHolderAnalysis(mockTokenData);
      const result2 = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result1).toEqual(result2);
    });
  });

  describe('Concentration Analysis', () => {
    it('should calculate concentration for large market cap tokens', async () => {
      mockTokenData.marketCap = 50000000; // 50M
      mockTokenData.pairCreatedAt = Date.now() - 86400000 * 365; // 1 year old
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.concentration.top10Percentage).toBeLessThan(60);
      expect(result.concentration.riskLevel).toBe('low');
      expect(result.concentration.score).toBeLessThan(80);
    });

    it('should calculate concentration for small market cap tokens', async () => {
      mockTokenData.marketCap = 100000; // 100K
      mockTokenData.pairCreatedAt = Date.now() - 86400000; // 1 day old
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.concentration.top10Percentage).toBeGreaterThan(40);
      expect(['medium', 'high', 'extreme']).toContain(result.concentration.riskLevel);
    });

    it('should identify extreme concentration risk', async () => {
      mockTokenData.marketCap = 50000; // Very small
      mockTokenData.pairCreatedAt = Date.now() - 86400000; // Very new
      mockTokenData.volume24h = 5000; // Low volume
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(['high', 'extreme']).toContain(result.concentration.riskLevel);
      expect(result.concentration.top10Percentage).toBeGreaterThan(55);
    });

    it('should calculate top holder percentages consistently', async () => {
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.concentration.top20Percentage).toBeGreaterThan(result.concentration.top10Percentage);
      expect(result.concentration.top100Percentage).toBeGreaterThan(result.concentration.top20Percentage);
      expect(result.concentration.top100Percentage).toBeLessThanOrEqual(95);
    });
  });

  describe('Distribution Analysis', () => {
    it('should estimate holder count based on market cap', async () => {
      mockTokenData.marketCap = 10000000; // 10M
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.distribution.totalHolders).toBeGreaterThan(500);
      expect(result.distribution.distributionHealth).toBe('healthy');
    });

    it('should identify risky distribution with few holders', async () => {
      mockTokenData.marketCap = 50000; // Very small
      mockTokenData.volume24h = 5000; // Low volume
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.distribution.totalHolders).toBeLessThan(500);
      expect(['concerning', 'risky']).toContain(result.distribution.distributionHealth);
    });

    it('should calculate average and median holdings', async () => {
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.distribution.averageHolding).toBeGreaterThan(0);
      expect(result.distribution.medianHolding).toBeLessThan(result.distribution.averageHolding);
      expect(result.distribution.holderGrowth24h).toBeGreaterThan(-10);
      expect(result.distribution.holderGrowth24h).toBeLessThan(20);
    });

    it('should adjust holder count for token age', async () => {
      // Old token
      mockTokenData.pairCreatedAt = Date.now() - 86400000 * 400; // Over 1 year
      const oldResult = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      // New token
      mockTokenData.pairCreatedAt = Date.now() - 86400000; // 1 day
      const newResult = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(oldResult.distribution.totalHolders).toBeGreaterThan(newResult.distribution.totalHolders);
    });
  });

  describe('Liquidity Risk Analysis', () => {
    it('should estimate liquidity providers count', async () => {
      mockTokenData.liquidity = 500000; // 500K liquidity
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.liquidityRisk.liquidityProviders).toBeGreaterThan(3);
      expect(result.liquidityRisk.lpConcentration).toBeGreaterThan(0);
      expect(result.liquidityRisk.lpConcentration).toBeLessThanOrEqual(100);
    });

    it('should identify high liquidity concentration risk', async () => {
      mockTokenData.liquidity = 100000; // Low liquidity
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(['medium', 'high']).toContain(result.liquidityRisk.riskLevel);
      expect(result.liquidityRisk.lpConcentration).toBeGreaterThan(60);
    });

    it('should identify low liquidity concentration risk', async () => {
      mockTokenData.liquidity = 2000000; // High liquidity
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(['low', 'medium']).toContain(result.liquidityRisk.riskLevel);
      expect(result.liquidityRisk.lpConcentration).toBeLessThan(70);
    });

    it('should provide unlock schedule estimates', async () => {
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.liquidityRisk.unlockSchedule.next24h).toBeGreaterThanOrEqual(0);
      expect(result.liquidityRisk.unlockSchedule.next7d).toBeGreaterThanOrEqual(result.liquidityRisk.unlockSchedule.next24h);
      expect(result.liquidityRisk.unlockSchedule.next30d).toBeGreaterThanOrEqual(result.liquidityRisk.unlockSchedule.next7d);
    });
  });

  describe('Whale Holder Analysis', () => {
    it('should estimate whale count based on market cap', async () => {
      mockTokenData.marketCap = 100000000; // 100M
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.whaleHolders.whaleCount).toBeGreaterThan(10);
      expect(result.whaleHolders.whalePercentage).toBeGreaterThan(20);
    });

    it('should identify whale accumulation pattern', async () => {
      mockTokenData.priceChange24h = 8; // Positive price change
      mockTokenData.volume24h = 150000; // Moderate volume
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.whaleHolders.accumulating).toBe(true);
      expect(result.whaleHolders.distributing).toBe(false);
    });

    it('should identify whale distribution pattern', async () => {
      mockTokenData.priceChange24h = -8; // Negative price change
      mockTokenData.volume24h = 300000; // High volume
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.whaleHolders.distributing).toBe(true);
      expect(result.whaleHolders.accumulating).toBe(false);
    });

    it('should detect recent whale activity', async () => {
      mockTokenData.volume24h = 200000; // High volume relative to market cap
      mockTokenData.marketCap = 1000000;
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.whaleHolders.recentActivity).toBe(true);
    });
  });

  describe('Signal Generation', () => {
    it('should generate concentration risk signals', async () => {
      mockTokenData.marketCap = 100000; // Small cap
      mockTokenData.pairCreatedAt = Date.now() - 86400000; // Very new
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      const concentrationSignals = result.signals.filter(s => s.type === 'concentration_risk');
      expect(concentrationSignals.length).toBeGreaterThan(0);
      expect(concentrationSignals[0].risk).toBeGreaterThan(60);
    });

    it('should generate distribution risk signals', async () => {
      mockTokenData.marketCap = 80000; // Very small cap
      mockTokenData.volume24h = 5000; // Low volume
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      const distributionSignals = result.signals.filter(s => s.type === 'distribution_risk');
      expect(distributionSignals.length).toBeGreaterThan(0);
    });

    it('should generate whale risk signals for distribution', async () => {
      mockTokenData.priceChange24h = -10; // Strong negative change
      mockTokenData.volume24h = 400000; // High volume
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      const whaleSignals = result.signals.filter(s => s.type === 'whale_risk' && s.risk > 70);
      expect(whaleSignals.length).toBeGreaterThan(0);
      expect(whaleSignals[0].signal).toContain('Distribution');
    });

    it('should generate positive whale signals for accumulation', async () => {
      mockTokenData.priceChange24h = 8; // Positive change
      mockTokenData.volume24h = 120000; // Moderate volume
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      const whaleSignals = result.signals.filter(s => s.type === 'whale_risk' && s.risk < 30);
      expect(whaleSignals.length).toBeGreaterThan(0);
      expect(whaleSignals[0].signal).toContain('Accumulation');
    });

    it('should generate liquidity risk signals', async () => {
      mockTokenData.liquidity = 50000; // Very low liquidity
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      const liquiditySignals = result.signals.filter(s => s.type === 'liquidity_risk');
      expect(liquiditySignals.length).toBeGreaterThan(0);
    });

    it('should provide appropriate recommendations', async () => {
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      result.signals.forEach(signal => {
        expect(signal.recommendation).toBeDefined();
        expect(signal.recommendation.length).toBeGreaterThan(5);
        if (signal.risk > 70) {
          expect(signal.recommendation).toMatch(/AVOID|CAUTION/i);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero market cap', async () => {
      mockTokenData.marketCap = 0;
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.concentration.top10Percentage).toBeGreaterThan(0);
      expect(result.distribution.totalHolders).toBeGreaterThan(50);
    });

    it('should handle zero volume', async () => {
      mockTokenData.volume24h = 0;
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.whaleHolders.recentActivity).toBe(false);
      expect(result.whaleHolders.accumulating).toBe(false);
      expect(result.whaleHolders.distributing).toBe(false);
    });

    it('should handle zero liquidity', async () => {
      mockTokenData.liquidity = 0;
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(result.liquidityRisk.liquidityProviders).toBe(3); // Minimum
      expect(['medium', 'high']).toContain(result.liquidityRisk.riskLevel);
    });

    it('should handle very new tokens', async () => {
      mockTokenData.pairCreatedAt = Date.now() - 3600000; // 1 hour old
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      expect(['medium', 'high', 'extreme']).toContain(result.concentration.riskLevel);
      expect(['concerning', 'risky']).toContain(result.distribution.distributionHealth);
    });

    it('should handle service errors gracefully', async () => {
      // Test with invalid data
      const invalidTokenData = { ...mockTokenData, pairCreatedAt: -1 };
      const result = await holderAnalysisService.getHolderAnalysis(invalidTokenData);

      // Should still return valid structure
      expect(result).toHaveProperty('concentration');
      expect(result).toHaveProperty('signals');
      expect(Array.isArray(result.signals)).toBe(true);
    });
  });

  describe('Signal Quality', () => {
    it('should provide risk and confidence scores for all signals', async () => {
      mockTokenData.marketCap = 100000; // Ensure some signals are generated
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      result.signals.forEach(signal => {
        expect(signal.risk).toBeGreaterThanOrEqual(0);
        expect(signal.risk).toBeLessThanOrEqual(100);
        expect(signal.confidence).toBeGreaterThanOrEqual(0);
        expect(signal.confidence).toBeLessThanOrEqual(100);
        expect(signal.description).toBeDefined();
        expect(signal.recommendation).toBeDefined();
      });
    });

    it('should have consistent signal types', async () => {
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      result.signals.forEach(signal => {
        expect(['concentration_risk', 'distribution_risk', 'liquidity_risk', 'whale_risk']).toContain(signal.type);
      });
    });

    it('should prioritize high-risk signals', async () => {
      mockTokenData.marketCap = 50000; // Very small cap to trigger high risk
      mockTokenData.pairCreatedAt = Date.now() - 86400000; // New token
      const result = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      const highRiskSignals = result.signals.filter(s => s.risk > 70);
      const mediumRiskSignals = result.signals.filter(s => s.risk > 40 && s.risk <= 70);

      expect(highRiskSignals.length).toBeGreaterThan(0);
      
      // High risk signals should have higher confidence on average
      if (highRiskSignals.length > 0 && mediumRiskSignals.length > 0) {
        const avgHighRiskConfidence = highRiskSignals.reduce((sum, s) => sum + s.confidence, 0) / highRiskSignals.length;
        const avgMediumRiskConfidence = mediumRiskSignals.reduce((sum, s) => sum + s.confidence, 0) / mediumRiskSignals.length;
        expect(avgHighRiskConfidence).toBeGreaterThanOrEqual(avgMediumRiskConfidence - 10);
      }
    });
  });

  describe('Age Impact', () => {
    it('should show better distribution health for older tokens', async () => {
      // Old token
      mockTokenData.pairCreatedAt = Date.now() - 86400000 * 365; // 1 year
      mockTokenData.marketCap = 5000000;
      const oldResult = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      // New token with same market cap
      mockTokenData.pairCreatedAt = Date.now() - 86400000; // 1 day
      const newResult = await holderAnalysisService.getHolderAnalysis(mockTokenData);

      // Older token should have lower concentration risk
      expect(oldResult.concentration.top10Percentage).toBeLessThan(newResult.concentration.top10Percentage);
      expect(oldResult.distribution.totalHolders).toBeGreaterThan(newResult.distribution.totalHolders);
    });
  });
}); 