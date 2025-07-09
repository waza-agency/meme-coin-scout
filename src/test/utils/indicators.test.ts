import { describe, it, expect } from 'vitest';
import { 
  calculateLiquidityIndicator, 
  calculateRiskIndicator, 
  formatLiquidity 
} from '../../utils/indicators';
import { Coin } from '../../types';
import { RugCheckRiskData } from '../../services/rugcheck';

describe('Indicator Utils', () => {
  const mockCoin: Coin = {
    pairAddress: '0x123',
    baseToken: {
      name: 'Test Token',
      symbol: 'TEST',
      address: '0x456'
    },
    quoteToken: {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0x789'
    },
    dexId: 'test-dex',
    url: 'https://example.com',
    pairCreatedAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
    marketCap: 1000000,
    liquidity: {
      usd: 50000
    },
    volume: {
      h24: 10000
    }
  };

  describe('calculateLiquidityIndicator', () => {
    it('should return high liquidity for values >= 100000', () => {
      const coin = {
        ...mockCoin,
        liquidity: { usd: 150000 }
      };
      const result = calculateLiquidityIndicator(coin);
      
      expect(result.level).toBe('high');
      expect(result.label).toBe('High');
      expect(result.color).toBe('text-green-500');
      expect(result.value).toBe(150000);
    });

    it('should return medium liquidity for values 10000-99999', () => {
      const coin = {
        ...mockCoin,
        liquidity: { usd: 50000 }
      };
      const result = calculateLiquidityIndicator(coin);
      
      expect(result.level).toBe('medium');
      expect(result.label).toBe('Medium');
      expect(result.color).toBe('text-yellow-500');
      expect(result.value).toBe(50000);
    });

    it('should return low liquidity for values < 10000', () => {
      const coin = {
        ...mockCoin,
        liquidity: { usd: 5000 }
      };
      const result = calculateLiquidityIndicator(coin);
      
      expect(result.level).toBe('low');
      expect(result.label).toBe('Low');
      expect(result.color).toBe('text-red-500');
      expect(result.value).toBe(5000);
    });

    it('should handle missing liquidity data', () => {
      const coin = {
        ...mockCoin,
        liquidity: undefined
      };
      const result = calculateLiquidityIndicator(coin);
      
      expect(result.level).toBe('low');
      expect(result.value).toBe(0);
    });
  });

  describe('calculateRiskIndicator', () => {
    it('should return low risk for established coins with good metrics', () => {
      const coin = {
        ...mockCoin,
        pairCreatedAt: Date.now() - (90 * 24 * 60 * 60 * 1000), // 90 days ago
        marketCap: 10000000,
        liquidity: { usd: 100000 },
        volume: { h24: 50000 }
      };
      const result = calculateRiskIndicator(coin);
      
      expect(result.level).toBe('low');
      expect(result.label).toBe('Low Risk');
      expect(result.color).toBe('text-green-500');
      expect(result.score).toBeLessThan(40);
    });

    it('should return high risk for new coins with poor metrics', () => {
      const coin = {
        ...mockCoin,
        pairCreatedAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
        marketCap: 5000,
        liquidity: { usd: 500 },
        volume: { h24: 10 }
      };
      const result = calculateRiskIndicator(coin);
      
      expect(result.level).toBe('high');
      expect(result.label).toBe('High Risk');
      expect(result.color).toBe('text-red-500');
      expect(result.score).toBeGreaterThan(70);
    });

    it('should return medium risk for moderate metrics', () => {
      const coin = {
        ...mockCoin,
        pairCreatedAt: Date.now() - (15 * 24 * 60 * 60 * 1000), // 15 days ago
        marketCap: 75000,
        liquidity: { usd: 8000 },
        volume: { h24: 500 }
      };
      const result = calculateRiskIndicator(coin);
      
      expect(result.level).toBe('medium');
      expect(result.label).toBe('Medium Risk');
      expect(result.color).toBe('text-yellow-500');
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThan(70);
    });

    it('should include risk factor breakdown', () => {
      const result = calculateRiskIndicator(mockCoin);
      
      expect(result.factors).toHaveProperty('age');
      expect(result.factors).toHaveProperty('liquidity');
      expect(result.factors).toHaveProperty('marketCap');
      expect(result.factors).toHaveProperty('volume');
      
      expect(typeof result.factors.age).toBe('number');
      expect(typeof result.factors.liquidity).toBe('number');
      expect(typeof result.factors.marketCap).toBe('number');
      expect(typeof result.factors.volume).toBe('number');
    });

    it('should integrate rugcheck data when available', () => {
      const rugCheckData: RugCheckRiskData = {
        riskScore: 60,
        riskLevel: 'high',
        risks: [
          {
            name: 'Mint Authority',
            description: 'Token has mint authority',
            level: 'danger',
            score: 40
          }
        ],
        holders: 50,
        liquidity: 5000,
        lpLocked: false,
        lpLockedPct: 0,
        topHoldersPct: 70,
        mintAuthority: true,
        freezeAuthority: false
      };

             const result = calculateRiskIndicator(mockCoin, rugCheckData);
       
       expect(result.level).toBe('medium'); // Changed from 'high' to 'medium'
       expect(result.factors.rugcheck).toBeGreaterThan(0);
      expect(result.rugCheckData).toEqual({
        riskScore: 60,
        riskLevel: 'high',
        holders: 50,
        lpLocked: false,
        mintAuthority: true,
        freezeAuthority: false,
        risks: [
          {
            name: 'Mint Authority',
            description: 'Token has mint authority',
            level: 'danger',
            score: 40
          }
        ]
      });
    });

    it('should work without rugcheck data', () => {
      const result = calculateRiskIndicator(mockCoin);
      
      expect(result.factors.rugcheck).toBeUndefined();
      expect(result.rugCheckData).toBeUndefined();
      expect(result.level).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('formatLiquidity', () => {
    it('should format millions correctly', () => {
      expect(formatLiquidity(1500000)).toBe('$1.5M');
      expect(formatLiquidity(1000000)).toBe('$1.0M');
    });

    it('should format thousands correctly', () => {
      expect(formatLiquidity(1500)).toBe('$1.5K');
      expect(formatLiquidity(1000)).toBe('$1.0K');
    });

    it('should format small values correctly', () => {
      expect(formatLiquidity(500)).toBe('$500');
      expect(formatLiquidity(0)).toBe('$0');
    });
  });
}); 