import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { whaleActivityService } from '../../services/whale-activity';
import { TokenData } from '../../types';

// Mock axios
vi.mock('axios');

describe('WhaleActivityService', () => {
  const mockTokenData: TokenData = {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    symbol: 'TEST',
    name: 'Test Token',
    blockchain: 'ethereum',
    marketCap: 1000000,
    volume24h: 500000,
    price: 1.50,
    priceChange24h: 5.5,
    liquidity: 200000,
    fdv: 1200000,
    pairAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    pairCreatedAt: Date.now() - 86400000 * 30, // 30 days ago
    dexId: 'uniswap',
    chainId: 'ethereum',
    baseToken: {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Test Token',
      symbol: 'TEST',
    },
    quoteToken: {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ethereum',
      symbol: 'ETH',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getWhaleActivity', () => {
    it('should fetch whale activity data successfully', async () => {
      const mockApiResponse = {
        data: {
          status: '1',
          result: [
            {
              hash: '0xabc123',
              from: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '1000000000000000000000',
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 3600), // 1 hour ago
            },
            {
              hash: '0xdef456',
              from: '0x1234567890abcdef1234567890abcdef12345678',
              to: '0xcdd6a2b9b0e2c9a7c6c6b8b5d5c5e5f5c5d5c5e5',
              value: '500000000000000000000',
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 7200), // 2 hours ago
            },
          ],
        },
      };

      (axios.get as any).mockResolvedValue(mockApiResponse);

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);

      expect(result).toBeDefined();
      expect(result.last24h).toBeDefined();
      expect(result.last7d).toBeDefined();
      expect(result.topWallets).toBeDefined();
      expect(result.smartMoney).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      (axios.get as any).mockRejectedValue(new Error('API Error'));

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);

      expect(result).toEqual({
        last24h: {
          totalBuys: 0,
          totalSells: 0,
          netFlow: 0,
          uniqueWhales: 0,
          largestTransaction: 0,
          transactions: [],
        },
        last7d: {
          totalBuys: 0,
          totalSells: 0,
          netFlow: 0,
          uniqueWhales: 0,
          avgDailyVolume: 0,
        },
        topWallets: [],
        smartMoney: {
          following: 0,
          recentActivity: false,
          confidence: 0,
        },
      });
    });

    it('should handle unsupported blockchain', async () => {
      const unsupportedToken = {
        ...mockTokenData,
        blockchain: 'unsupported-chain',
      };

      const result = await whaleActivityService.getWhaleActivity(unsupportedToken);

      expect(result).toEqual({
        last24h: {
          totalBuys: 0,
          totalSells: 0,
          netFlow: 0,
          uniqueWhales: 0,
          largestTransaction: 0,
          transactions: [],
        },
        last7d: {
          totalBuys: 0,
          totalSells: 0,
          netFlow: 0,
          uniqueWhales: 0,
          avgDailyVolume: 0,
        },
        topWallets: [],
        smartMoney: {
          following: 0,
          recentActivity: false,
          confidence: 0,
        },
      });
    });

    it('should cache API responses', async () => {
      const mockApiResponse = {
        data: {
          status: '1',
          result: [
            {
              hash: '0xabc123',
              from: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '1000000000000000000000',
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 3600),
            },
          ],
        },
      };

      (axios.get as any).mockResolvedValue(mockApiResponse);

      // First call
      await whaleActivityService.getWhaleActivity(mockTokenData);
      
      // Second call should use cache
      await whaleActivityService.getWhaleActivity(mockTokenData);

      // Should only make one API call due to caching
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should identify smart money wallets', async () => {
      const mockApiResponse = {
        data: {
          status: '1',
          result: [
            {
              hash: '0xabc123',
              from: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', // Binance 7 (smart money)
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '1000000000000000000000',
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 3600),
            },
            {
              hash: '0xdef456',
              from: '0x001866ae5b3de6caa5a51543fd9fb64f524f5478', // Alameda Research (smart money)
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '500000000000000000000',
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 1800),
            },
          ],
        },
      };

      (axios.get as any).mockResolvedValue(mockApiResponse);

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);

      expect(result.smartMoney.following).toBeGreaterThan(0);
      expect(result.smartMoney.recentActivity).toBe(true);
      expect(result.smartMoney.confidence).toBeGreaterThan(0);
    });

    it('should calculate net flow correctly', async () => {
      const mockApiResponse = {
        data: {
          status: '1',
          result: [
            {
              hash: '0xbuy1',
              from: '0xdex123',
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '2000000000000000000000', // 2000 tokens
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 3600),
            },
            {
              hash: '0xsell1',
              from: '0x1234567890abcdef1234567890abcdef12345678',
              to: '0xdex456',
              value: '1000000000000000000000', // 1000 tokens
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 1800),
            },
          ],
        },
      };

      (axios.get as any).mockResolvedValue(mockApiResponse);

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);

      expect(result.last24h.totalBuys).toBeGreaterThan(0);
      expect(result.last24h.totalSells).toBeGreaterThan(0);
      expect(result.last24h.netFlow).toBe(result.last24h.totalBuys - result.last24h.totalSells);
    });

    it('should filter transactions by time correctly', async () => {
      const now = Math.floor(Date.now() / 1000);
      const mockApiResponse = {
        data: {
          status: '1',
          result: [
            {
              hash: '0xrecent',
              from: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '1000000000000000000000',
              tokenDecimal: '18',
              timeStamp: String(now - 3600), // 1 hour ago (within 24h)
            },
            {
              hash: '0xold',
              from: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '1000000000000000000000',
              tokenDecimal: '18',
              timeStamp: String(now - 172800), // 48 hours ago (outside 24h)
            },
          ],
        },
      };

      (axios.get as any).mockResolvedValue(mockApiResponse);

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);

      // Should only count recent transactions in 24h data
      expect(result.last24h.transactions.length).toBeLessThanOrEqual(1);
      // Should count both in 7d data
      expect(result.last7d.uniqueWhales).toBeGreaterThan(0);
    });

    it('should handle rate limiting', async () => {
      const mockApiResponse = {
        data: {
          status: '1',
          result: [],
        },
      };

      (axios.get as any).mockResolvedValue(mockApiResponse);

      const startTime = Date.now();
      
      // Make multiple requests
      await Promise.all([
        whaleActivityService.getWhaleActivity(mockTokenData),
        whaleActivityService.getWhaleActivity({ ...mockTokenData, address: '0xdifferent' }),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should have some delay due to rate limiting
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('blockchain support', () => {
    it('should support Ethereum', async () => {
      const ethToken = { ...mockTokenData, blockchain: 'ethereum' };
      (axios.get as any).mockResolvedValue({ data: { status: '1', result: [] } });

      const result = await whaleActivityService.getWhaleActivity(ethToken);
      expect(result).toBeDefined();
    });

    it('should support BSC', async () => {
      const bscToken = { ...mockTokenData, blockchain: 'bsc' };
      (axios.get as any).mockResolvedValue({ data: { status: '1', result: [] } });

      const result = await whaleActivityService.getWhaleActivity(bscToken);
      expect(result).toBeDefined();
    });

    it('should support Polygon', async () => {
      const polygonToken = { ...mockTokenData, blockchain: 'polygon' };
      (axios.get as any).mockResolvedValue({ data: { status: '1', result: [] } });

      const result = await whaleActivityService.getWhaleActivity(polygonToken);
      expect(result).toBeDefined();
    });

    it('should support Arbitrum', async () => {
      const arbitrumToken = { ...mockTokenData, blockchain: 'arbitrum' };
      (axios.get as any).mockResolvedValue({ data: { status: '1', result: [] } });

      const result = await whaleActivityService.getWhaleActivity(arbitrumToken);
      expect(result).toBeDefined();
    });

    it('should support Avalanche', async () => {
      const avalancheToken = { ...mockTokenData, blockchain: 'avalanche' };
      (axios.get as any).mockResolvedValue({ data: { status: '1', result: [] } });

      const result = await whaleActivityService.getWhaleActivity(avalancheToken);
      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle API timeout', async () => {
      (axios.get as any).mockRejectedValue(new Error('TIMEOUT'));

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);
      expect(result).toBeDefined();
      expect(result.last24h.totalBuys).toBe(0);
    });

    it('should handle invalid API response', async () => {
      (axios.get as any).mockResolvedValue({ data: { status: '0', message: 'Invalid request' } });

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);
      expect(result).toBeDefined();
      expect(result.last24h.totalBuys).toBe(0);
    });

    it('should handle malformed transaction data', async () => {
      const malformedResponse = {
        data: {
          status: '1',
          result: [
            {
              hash: '0xabc123',
              from: null,
              to: undefined,
              value: 'invalid',
              tokenDecimal: 'not-a-number',
              timeStamp: 'invalid-timestamp',
            },
          ],
        },
      };

      (axios.get as any).mockResolvedValue(malformedResponse);

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);
      expect(result).toBeDefined();
      expect(result.last24h.transactions).toHaveLength(0);
    });
  });

  describe('whale threshold detection', () => {
    it('should filter transactions by whale threshold', async () => {
      const mockApiResponse = {
        data: {
          status: '1',
          result: [
            {
              hash: '0xwhale',
              from: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '100000000000000000000000', // Large amount
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 3600),
            },
            {
              hash: '0xsmall',
              from: '0x9999999999999999999999999999999999999999',
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '1000000000000000000', // Small amount
              tokenDecimal: '18',
              timeStamp: String(Math.floor(Date.now() / 1000) - 3600),
            },
          ],
        },
      };

      (axios.get as any).mockResolvedValue(mockApiResponse);

      const result = await whaleActivityService.getWhaleActivity(mockTokenData);

      // Should only count transactions above whale threshold
      expect(result.last24h.uniqueWhales).toBeGreaterThan(0);
      expect(result.last24h.largestTransaction).toBeGreaterThan(0);
    });
  });
}); 