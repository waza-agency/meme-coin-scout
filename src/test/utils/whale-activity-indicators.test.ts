import { describe, it, expect } from 'vitest';
import { 
  calculateWhaleActivityIndicator, 
  formatWhaleNetFlow, 
  getWhaleActivityColor, 
  getWhaleActivityEmoji 
} from '../../utils/indicators';
import { WhaleActivityData } from '../../types';

describe('Whale Activity Indicators', () => {
  const createMockWhaleData = (overrides?: Partial<WhaleActivityData>): WhaleActivityData => ({
    last24h: {
      totalBuys: 100000,
      totalSells: 80000,
      netFlow: 20000,
      uniqueWhales: 5,
      largestTransaction: 50000,
      transactions: [],
    },
    last7d: {
      totalBuys: 700000,
      totalSells: 600000,
      netFlow: 100000,
      uniqueWhales: 15,
      avgDailyVolume: 200000,
    },
    topWallets: [],
    smartMoney: {
      following: 2,
      recentActivity: true,
      confidence: 60,
    },
    ...overrides,
  });

  describe('calculateWhaleActivityIndicator', () => {
    it('should calculate bullish trend for high positive net flow', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 200000,
          totalSells: 100000,
          netFlow: 100000, // +$100k net flow
          uniqueWhales: 8,
          largestTransaction: 75000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.trend).toBe('bullish');
      expect(indicator.color).toBe('#10b981');
      expect(indicator.netFlow24h).toBe(100000);
    });

    it('should calculate bearish trend for high negative net flow', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 50000,
          totalSells: 150000,
          netFlow: -100000, // -$100k net flow
          uniqueWhales: 6,
          largestTransaction: 60000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.trend).toBe('bearish');
      expect(indicator.color).toBe('#ef4444');
      expect(indicator.netFlow24h).toBe(-100000);
    });

    it('should calculate neutral trend for moderate net flow', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 110000,
          totalSells: 90000,
          netFlow: 20000, // +$20k net flow (within neutral range)
          uniqueWhales: 4,
          largestTransaction: 40000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.trend).toBe('neutral');
      expect(indicator.color).toBe('#6b7280');
      expect(indicator.netFlow24h).toBe(20000);
    });

    it('should calculate high activity level for high volume', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 400000,
          totalSells: 350000,
          netFlow: 50000,
          uniqueWhales: 12,
          largestTransaction: 100000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.activity).toBe('high');
      expect(indicator.confidence).toBeGreaterThan(70);
    });

    it('should calculate medium activity level for moderate volume', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 150000,
          totalSells: 100000,
          netFlow: 50000,
          uniqueWhales: 6,
          largestTransaction: 50000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.activity).toBe('medium');
    });

    it('should calculate low activity level for low volume', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 30000,
          totalSells: 20000,
          netFlow: 10000,
          uniqueWhales: 2,
          largestTransaction: 15000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.activity).toBe('low');
    });

    it('should calculate high risk level for heavy selling', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 50000,
          totalSells: 300000,
          netFlow: -250000, // Heavy selling
          uniqueWhales: 8,
          largestTransaction: 100000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.riskLevel).toBe('high');
    });

    it('should calculate medium risk level for moderate selling', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 80000,
          totalSells: 150000,
          netFlow: -70000, // Moderate selling
          uniqueWhales: 5,
          largestTransaction: 40000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.riskLevel).toBe('medium');
    });

    it('should calculate low risk level for positive net flow', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 120000,
          totalSells: 80000,
          netFlow: 40000, // Positive net flow
          uniqueWhales: 6,
          largestTransaction: 30000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.riskLevel).toBe('low');
    });

    it('should generate appropriate signals for strong accumulation', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 300000,
          totalSells: 100000,
          netFlow: 200000, // Strong accumulation
          uniqueWhales: 12,
          largestTransaction: 250000,
          transactions: [],
        },
        smartMoney: {
          following: 5,
          recentActivity: true,
          confidence: 80,
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.signals).toContain('Strong accumulation');
      expect(indicator.signals).toContain('High whale interest');
      expect(indicator.signals).toContain('Smart money following');
      expect(indicator.signals).toContain('Recent smart money activity');
      expect(indicator.signals).toContain('Large transaction detected');
    });

    it('should generate appropriate signals for heavy selling', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 50000,
          totalSells: 200000,
          netFlow: -150000, // Heavy selling
          uniqueWhales: 8,
          largestTransaction: 80000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.signals).toContain('Heavy selling');
    });

    it('should calculate confidence based on multiple factors', () => {
      const highConfidenceData = createMockWhaleData({
        last24h: {
          totalBuys: 500000,
          totalSells: 300000,
          netFlow: 200000,
          uniqueWhales: 15, // High whale count
          largestTransaction: 150000,
          transactions: [],
        },
        smartMoney: {
          following: 8,
          recentActivity: true,
          confidence: 90, // High smart money confidence
        },
      });

      const indicator = calculateWhaleActivityIndicator(highConfidenceData);

      expect(indicator.confidence).toBeGreaterThan(80);
    });

    it('should create proper label with net flow and whale count', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 150000,
          totalSells: 100000,
          netFlow: 50000,
          uniqueWhales: 7,
          largestTransaction: 40000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.label).toContain('$50.0K');
      expect(indicator.label).toContain('7 whales');
    });

    it('should handle zero whale activity', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 0,
          totalSells: 0,
          netFlow: 0,
          uniqueWhales: 0,
          largestTransaction: 0,
          transactions: [],
        },
        smartMoney: {
          following: 0,
          recentActivity: false,
          confidence: 0,
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.trend).toBe('neutral');
      expect(indicator.activity).toBe('low');
      expect(indicator.confidence).toBe(0);
      expect(indicator.signals).toHaveLength(0);
    });
  });

  describe('formatWhaleNetFlow', () => {
    it('should format positive millions correctly', () => {
      expect(formatWhaleNetFlow(1500000)).toBe('+$1.5M');
      expect(formatWhaleNetFlow(2000000)).toBe('+$2.0M');
      expect(formatWhaleNetFlow(1234567)).toBe('+$1.2M');
    });

    it('should format negative millions correctly', () => {
      expect(formatWhaleNetFlow(-1500000)).toBe('-$1.5M');
      expect(formatWhaleNetFlow(-2000000)).toBe('-$2.0M');
      expect(formatWhaleNetFlow(-1234567)).toBe('-$1.2M');
    });

    it('should format positive thousands correctly', () => {
      expect(formatWhaleNetFlow(50000)).toBe('+$50.0K');
      expect(formatWhaleNetFlow(1500)).toBe('+$1.5K');
      expect(formatWhaleNetFlow(999)).toBe('+$999');
    });

    it('should format negative thousands correctly', () => {
      expect(formatWhaleNetFlow(-50000)).toBe('-$50.0K');
      expect(formatWhaleNetFlow(-1500)).toBe('-$1.5K');
      expect(formatWhaleNetFlow(-999)).toBe('-$999');
    });

    it('should format small amounts correctly', () => {
      expect(formatWhaleNetFlow(100)).toBe('+$100');
      expect(formatWhaleNetFlow(-100)).toBe('-$100');
      expect(formatWhaleNetFlow(0)).toBe('+$0');
    });

    it('should handle edge cases', () => {
      expect(formatWhaleNetFlow(1000000)).toBe('+$1.0M');
      expect(formatWhaleNetFlow(-1000000)).toBe('-$1.0M');
      expect(formatWhaleNetFlow(1000)).toBe('+$1.0K');
      expect(formatWhaleNetFlow(-1000)).toBe('-$1.0K');
    });
  });

  describe('getWhaleActivityColor', () => {
    it('should return correct colors for each trend', () => {
      expect(getWhaleActivityColor('bullish')).toBe('#10b981');
      expect(getWhaleActivityColor('bearish')).toBe('#ef4444');
      expect(getWhaleActivityColor('neutral')).toBe('#6b7280');
    });
  });

  describe('getWhaleActivityEmoji', () => {
    it('should return correct emojis for each trend', () => {
      expect(getWhaleActivityEmoji('bullish')).toBe('🐋📈');
      expect(getWhaleActivityEmoji('bearish')).toBe('🐋📉');
      expect(getWhaleActivityEmoji('neutral')).toBe('🐋➡️');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined smart money data', () => {
      const data = createMockWhaleData({
        smartMoney: {
          following: 0,
          recentActivity: false,
          confidence: 0,
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator).toBeDefined();
      expect(indicator.confidence).toBeGreaterThan(0); // Should still have confidence from other factors
    });

    it('should handle very large numbers', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 10000000,
          totalSells: 5000000,
          netFlow: 5000000,
          uniqueWhales: 50,
          largestTransaction: 2000000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator.trend).toBe('bullish');
      expect(indicator.activity).toBe('high');
      expect(indicator.confidence).toBe(100); // Should cap at 100%
    });

    it('should handle negative whale counts gracefully', () => {
      const data = createMockWhaleData({
        last24h: {
          totalBuys: 50000,
          totalSells: 40000,
          netFlow: 10000,
          uniqueWhales: -1, // Invalid negative count
          largestTransaction: 20000,
          transactions: [],
        },
      });

      const indicator = calculateWhaleActivityIndicator(data);

      expect(indicator).toBeDefined();
      expect(indicator.confidence).toBeGreaterThan(0);
    });
  });
}); 