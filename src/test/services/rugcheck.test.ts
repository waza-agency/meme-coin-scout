import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { rugCheckService } from '../../services/rugcheck';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('RugCheckService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTokenRisk', () => {
    it('should return risk data for valid token', async () => {
      const mockResponse = {
        data: {
          mint: 'TEST123',
          symbol: 'TEST',
          name: 'Test Token',
          description: 'A test token',
          image: 'https://example.com/image.png',
          creator: 'creator123',
          creation_tx: 'tx123',
          created_timestamp: 1640995200,
          mint_authority: null,
          freeze_authority: null,
          supply: 1000000,
          decimals: 9,
          holders: 500,
          total_supply: 1000000,
          circulating_supply: 1000000,
          markets: [{
            market: 'test-market',
            liquidity: 50000,
            volume_24h: 10000,
            price: 0.5,
            price_change_24h: 5.2,
            market_cap: 500000,
            fdv: 500000,
            pool_address: 'pool123',
            base_amount: 1000,
            quote_amount: 500,
            base_reserve: 1000,
            quote_reserve: 500,
            lp_locked: true,
            lp_locked_pct: 80,
            lp_burn_pct: 20,
            top_10_holders_pct: 30,
            risks: []
          }],
          risks: [
            {
              name: 'Low Liquidity',
              description: 'Token has low liquidity',
              level: 'warn' as const,
              score: 25
            }
          ],
          risk_score: 25,
          risk_level: 'medium' as const
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await rugCheckService.getTokenRisk('TEST123');

      expect(result).toEqual({
        riskScore: 25,
        riskLevel: 'medium',
        risks: [
          {
            name: 'Low Liquidity',
            description: 'Token has low liquidity',
            level: 'warn',
            score: 25
          }
        ],
        holders: 500,
        liquidity: 50000,
        lpLocked: true,
        lpLockedPct: 80,
        topHoldersPct: 30,
        mintAuthority: false,
        freezeAuthority: false
      });
    });

    it('should return null for API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const result = await rugCheckService.getTokenRisk('INVALID');

      expect(result).toBeNull();
    });

    it('should handle 404 errors gracefully', async () => {
      const error = new Error('Not Found');
      (error as any).response = { status: 404 };
      mockedAxios.get.mockRejectedValue(error);

      const result = await rugCheckService.getTokenRisk('NOTFOUND');

      expect(result).toBeNull();
    });

    it('should handle rate limiting', async () => {
      const error = new Error('Rate Limited');
      (error as any).response = { status: 429 };
      mockedAxios.get.mockRejectedValue(error);

      const result = await rugCheckService.getTokenRisk('RATELIMITED');

      expect(result).toBeNull();
    });
  });

  describe('getTokenRisksBatch', () => {
    it('should fetch multiple tokens with rate limiting', async () => {
      const mockResponse = {
        data: {
          mint: 'TEST123',
          symbol: 'TEST',
          name: 'Test Token',
          description: 'A test token',
          image: 'https://example.com/image.png',
          creator: 'creator123',
          creation_tx: 'tx123',
          created_timestamp: 1640995200,
          mint_authority: null,
          freeze_authority: null,
          supply: 1000000,
          decimals: 9,
          holders: 500,
          total_supply: 1000000,
          circulating_supply: 1000000,
          markets: [{
            market: 'test-market',
            liquidity: 50000,
            volume_24h: 10000,
            price: 0.5,
            price_change_24h: 5.2,
            market_cap: 500000,
            fdv: 500000,
            pool_address: 'pool123',
            base_amount: 1000,
            quote_amount: 500,
            base_reserve: 1000,
            quote_reserve: 500,
            lp_locked: true,
            lp_locked_pct: 80,
            lp_burn_pct: 20,
            top_10_holders_pct: 30,
            risks: []
          }],
          risks: [],
          risk_score: 10,
          risk_level: 'low' as const
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const tokens = ['TOKEN1', 'TOKEN2'];
      const result = await rugCheckService.getTokenRisksBatch(tokens);

      expect(result.size).toBe(2);
      expect(result.has('TOKEN1')).toBe(true);
      expect(result.has('TOKEN2')).toBe(true);
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });

      const result = await rugCheckService.testConnection();

      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Connection failed'));

      const result = await rugCheckService.testConnection();

      expect(result).toBe(false);
    });
  });
}); 