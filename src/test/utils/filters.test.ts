import { describe, it, expect } from 'vitest';
import { 
  calculateAge, 
  formatMarketCap, 
  formatAge, 
  filterCoins, 
  sortCoinsByMarketCap 
} from '../../utils/filters';
import { Coin, FilterCriteria } from '../../types';

describe('Filter Utils', () => {
  describe('calculateAge', () => {
    it('calculates age in days correctly', () => {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const age = calculateAge(oneDayAgo);
      expect(age).toBe(1);
    });

    it('handles same day creation', () => {
      const now = Date.now();
      const age = calculateAge(now);
      expect(age).toBe(0);
    });
  });

  describe('formatMarketCap', () => {
    it('formats billions correctly', () => {
      const result = formatMarketCap(5200000000);
      expect(result).toBe('$5.2B');
    });

    it('formats millions correctly', () => {
      const result = formatMarketCap(5200000);
      expect(result).toBe('$5.2M');
    });

    it('formats thousands correctly', () => {
      const result = formatMarketCap(5200);
      expect(result).toBe('$5.2K');
    });

    it('formats small amounts correctly', () => {
      const result = formatMarketCap(52);
      expect(result).toBe('$52.00');
    });
  });

  describe('formatAge', () => {
    it('formats today correctly', () => {
      const result = formatAge(0);
      expect(result).toBe('Today');
    });

    it('formats single day correctly', () => {
      const result = formatAge(1);
      expect(result).toBe('1 day');
    });

    it('formats multiple days correctly', () => {
      const result = formatAge(5);
      expect(result).toBe('5 days');
    });
  });

  describe('filterCoins', () => {
    const mockCoins: Coin[] = [
      {
        pairAddress: '1',
        baseToken: { name: 'Token1', symbol: 'T1', address: 'addr1' },
        quoteToken: { name: 'USDC', symbol: 'USDC', address: 'usdc' },
        dexId: 'test',
        url: 'https://test.com',
        pairCreatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        marketCap: 500000,
        priceNative: '1.0',
        txns: { h24: { buys: 10, sells: 5 }, h6: { buys: 5, sells: 2 }, h1: { buys: 2, sells: 1 }, m5: { buys: 1, sells: 0 } },
        liquidity: { usd: 100000 }
      },
      {
        pairAddress: '2',
        baseToken: { name: 'Token2', symbol: 'T2', address: 'addr2' },
        quoteToken: { name: 'USDC', symbol: 'USDC', address: 'usdc' },
        dexId: 'test',
        url: 'https://test.com',
        pairCreatedAt: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
        marketCap: 2000000,
        priceNative: '2.0',
        txns: { h24: { buys: 20, sells: 15 }, h6: { buys: 10, sells: 8 }, h1: { buys: 4, sells: 3 }, m5: { buys: 2, sells: 1 } },
        liquidity: { usd: 300000 }
      }
    ];

    it('filters coins by market cap and age', () => {
      const criteria: FilterCriteria = {
        minMarketCap: 100000,
        maxMarketCap: 1000000,
        minAge: 1,
        maxAge: 5,
        minLiquidity: 10000,
        maxLiquidity: 500000
      };

      const result = filterCoins(mockCoins, criteria);
      expect(result).toHaveLength(1);
      expect(result[0].pairAddress).toBe('1');
    });

    it('excludes coins without market cap', () => {
      const coinsWithoutMarketCap: Coin[] = [
        {
          ...mockCoins[0],
          marketCap: undefined,
          fdv: undefined,
          liquidity: { usd: 50000 }
        }
      ];

      const criteria: FilterCriteria = {
        minMarketCap: 0,
        maxMarketCap: 10000000,
        minAge: 0,
        maxAge: 30,
        minLiquidity: 0,
        maxLiquidity: 1000000
      };

      const result = filterCoins(coinsWithoutMarketCap, criteria);
      expect(result).toHaveLength(0);
    });
  });

  describe('sortCoinsByMarketCap', () => {
    it('sorts coins by market cap in descending order', () => {
      const coins: Coin[] = [
        {
          pairAddress: '1',
          baseToken: { name: 'Token1', symbol: 'T1', address: 'addr1' },
          quoteToken: { name: 'USDC', symbol: 'USDC', address: 'usdc' },
          dexId: 'test',
          url: 'https://test.com',
          pairCreatedAt: Date.now(),
          marketCap: 100000
        },
        {
          pairAddress: '2',
          baseToken: { name: 'Token2', symbol: 'T2', address: 'addr2' },
          quoteToken: { name: 'USDC', symbol: 'USDC', address: 'usdc' },
          dexId: 'test',
          url: 'https://test.com',
          pairCreatedAt: Date.now(),
          marketCap: 500000
        }
      ];

      const result = sortCoinsByMarketCap(coins);
      expect(result[0].marketCap).toBe(500000);
      expect(result[1].marketCap).toBe(100000);
    });
  });
}); 