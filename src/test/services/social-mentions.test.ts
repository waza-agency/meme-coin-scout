import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { SocialMentionsService } from '../../services/social-mentions';
import { SocialMentionsData } from '../../types';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('SocialMentionsService', () => {
  let service: SocialMentionsService;

  beforeEach(() => {
    service = new SocialMentionsService();
    vi.clearAllMocks();
  });

  describe('searchMentions', () => {
    it('should require X API Bearer Token', async () => {
      await expect(service.searchMentions('BTC')).rejects.toThrow(
        'X API Bearer Token is required'
      );
    });

    it('should search for mentions using X API', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              text: 'Bitcoin is going to the moon! 🚀',
              created_at: '2024-01-01T00:00:00Z',
              author_id: 'user1',
              public_metrics: {
                retweet_count: 10,
                like_count: 25,
                reply_count: 5,
                quote_count: 2
              }
            },
            {
              id: '2',
              text: 'BTC is a scam, avoid at all costs',
              created_at: '2024-01-01T01:00:00Z',
              author_id: 'user2',
              public_metrics: {
                retweet_count: 2,
                like_count: 1,
                reply_count: 0,
                quote_count: 0
              }
            }
          ],
          includes: {
            users: [
              {
                id: 'user1',
                public_metrics: {
                  followers_count: 1000
                }
              },
              {
                id: 'user2',
                public_metrics: {
                  followers_count: 500
                }
              }
            ]
          }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.searchMentions('BTC', '24h');

      expect(result).toEqual({
        current24h: 2,
        previous24h: 0, // No previous data in mock
        change: 2,
        changePercent: 0,
        sentiment: {
          positive: 1,
          negative: 1,
          neutral: 0
        },
        totalReach: expect.any(Number),
        topMentions: expect.any(Array)
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Current and previous period
    });

    it('should handle API errors properly', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.searchMentions('BTC')).rejects.toThrow();
    });

    it('should analyze sentiment correctly', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              text: 'Bitcoin bullish moon rocket! 🚀',
              created_at: '2024-01-01T00:00:00Z',
              author_id: 'user1',
              public_metrics: { retweet_count: 10, like_count: 25, reply_count: 5, quote_count: 2 }
            },
            {
              id: '2',
              text: 'BTC scam rugpull avoid',
              created_at: '2024-01-01T01:00:00Z',
              author_id: 'user2',
              public_metrics: { retweet_count: 2, like_count: 1, reply_count: 0, quote_count: 0 }
            },
            {
              id: '3',
              text: 'Bitcoin price update today',
              created_at: '2024-01-01T02:00:00Z',
              author_id: 'user3',
              public_metrics: { retweet_count: 1, like_count: 3, reply_count: 1, quote_count: 0 }
            }
          ],
          includes: {
            users: [
              { id: 'user1', public_metrics: { followers_count: 1000 } },
              { id: 'user2', public_metrics: { followers_count: 500 } },
              { id: 'user3', public_metrics: { followers_count: 250 } }
            ]
          }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.searchMentions('BTC', '24h');

      expect(result.sentiment.positive).toBe(1); // 'bullish moon rocket'
      expect(result.sentiment.negative).toBe(1); // 'scam rugpull avoid'
      expect(result.sentiment.neutral).toBe(1); // 'price update today'
    });
  });

  describe('buildSearchQuery', () => {
    it('should build comprehensive search query', () => {
      const buildSearchQuery = (service as any).buildSearchQuery.bind(service);
      
      const query = buildSearchQuery('BTC');
      
      expect(query).toContain('"BTC"');
      expect(query).toContain('"$BTC"');
      expect(query).toContain('BTC token');
      expect(query).toContain('BTC coin');
      expect(query).toContain('lang:en');
      expect(query).toContain('-is:retweet');
    });
  });

  describe('calculateTotalReach', () => {
    it('should calculate total reach correctly', () => {
      const calculateTotalReach = (service as any).calculateTotalReach.bind(service);
      
      const tweets = [
        {
          author_id: 'user1',
          public_metrics: { retweet_count: 10, like_count: 20, reply_count: 5, quote_count: 2 }
        }
      ];
      
      const users = [
        {
          id: 'user1',
          public_metrics: { followers_count: 1000 }
        }
      ];
      
      const reach = calculateTotalReach(tweets, users);
      expect(reach).toBe(1037); // 1000 + 10 + 20 + 5 + 2
    });
  });

  describe('extractTopMentions', () => {
    it('should extract and sort mentions by engagement', () => {
      const extractTopMentions = (service as any).extractTopMentions.bind(service);
      
      const tweets = [
        {
          text: 'Low engagement tweet',
          created_at: '2024-01-01T00:00:00Z',
          public_metrics: { retweet_count: 1, like_count: 2, reply_count: 0, quote_count: 0 }
        },
        {
          text: 'High engagement tweet',
          created_at: '2024-01-01T01:00:00Z',
          public_metrics: { retweet_count: 50, like_count: 100, reply_count: 25, quote_count: 10 }
        }
      ];
      
      const users: any[] = [];
      const mentions = extractTopMentions(tweets, users);
      
      expect(mentions).toHaveLength(2);
      expect(mentions[0].content).toContain('High engagement');
      expect(mentions[0].engagement).toBe(185); // 50 + 100 + 25 + 10
      expect(mentions[1].engagement).toBe(3); // 1 + 2 + 0 + 0
    });
  });
}); 