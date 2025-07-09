import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialMentionsService } from '../../services/social-mentions';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('SocialMentionsService', () => {
  let service: SocialMentionsService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Constructor', () => {
    it('should initialize with Xai API key', () => {
      service = new SocialMentionsService('test-xai-key');
      expect(service).toBeDefined();
      expect(console.log).toHaveBeenCalledWith('🔑 Social Mentions API Configuration Check:');
    });

    it('should initialize with Twitter bearer token', () => {
      service = new SocialMentionsService(undefined, 'test-twitter-token');
      expect(service).toBeDefined();
      expect(console.log).toHaveBeenCalledWith('🔑 Social Mentions API Configuration Check:');
    });

    it('should warn when no API keys are provided', () => {
      service = new SocialMentionsService();
      expect(console.error).toHaveBeenCalledWith('❌ No API keys found for social mentions. Please set VITE_XAI_API_KEY or VITE_TWITTER_BEARER_TOKEN environment variables.');
    });
  });

  describe('searchMentions with Xai API', () => {
    beforeEach(() => {
      service = new SocialMentionsService('test-xai-key');
    });

    it('should successfully search mentions using Xai API', async () => {
      const mockXaiResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                totalMentions: 150,
                sentiment: {
                  positive: 60,
                  negative: 30,
                  neutral: 60
                },
                engagement: {
                  totalReach: 25000,
                  averageEngagement: 50
                },
                topMentions: [
                  {
                    platform: 'twitter',
                    content: 'Great project! 🚀',
                    engagement: 100,
                    timestamp: Date.now()
                  }
                ]
              })
            }
          }]
        }
      };

      (mockedAxios.post as any).mockResolvedValue(mockXaiResponse);

      const result = await service.searchMentions('TESTTOKEN', '24h');

      expect(result).toEqual({
        current24h: 150,
        previous24h: 0, // Previous period would be 0 due to mock
        change: 150,
        changePercent: 0,
        sentiment: {
          positive: 60,
          negative: 30,
          neutral: 60
        },
        totalReach: 25000,
        topMentions: expect.arrayContaining([
          expect.objectContaining({
            platform: 'twitter',
            content: 'Great project! 🚀',
            engagement: 100
          })
        ])
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          model: 'grok-beta',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: 'You are a social media analytics expert. Provide realistic cryptocurrency social media analysis data.'
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('TESTTOKEN')
            })
          ])
        }),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-xai-key',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should handle Xai API JSON parsing errors gracefully', async () => {
      const mockXaiResponse = {
        data: {
          choices: [{
            message: {
              content: 'Invalid JSON response'
            }
          }]
        }
      };

      (mockedAxios.post as any).mockResolvedValue(mockXaiResponse);

      const result = await service.searchMentions('TESTTOKEN', '24h');

      expect(result).toEqual(expect.objectContaining({
        current24h: expect.any(Number),
        previous24h: expect.any(Number),
        sentiment: expect.objectContaining({
          positive: expect.any(Number),
          negative: expect.any(Number),
          neutral: expect.any(Number)
        }),
        totalReach: expect.any(Number),
        topMentions: expect.any(Array)
      }));

      expect(console.warn).toHaveBeenCalledWith('Failed to parse Xai API response as JSON, using fallback data');
    });

    it('should fallback to Twitter API when Xai API fails', async () => {
      // Create service with both API keys
      service = new SocialMentionsService('test-xai-key', 'test-twitter-token');
      
      // Mock Xai API to fail
      (mockedAxios.post as any).mockRejectedValue(new Error('Xai API Error'));
      
      // Mock Twitter API to succeed
      const mockTwitterResponse = {
        data: {
          data: [
            {
              id: '1',
              text: 'Test tweet about TESTTOKEN',
              created_at: new Date().toISOString(),
              author_id: 'user1',
              public_metrics: {
                retweet_count: 10,
                like_count: 25,
                reply_count: 5,
                quote_count: 2
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
              }
            ]
          }
        }
      };

      (mockedAxios.get as any).mockResolvedValue(mockTwitterResponse);

      const result = await service.searchMentions('TESTTOKEN', '24h');

      expect(result).toEqual(expect.objectContaining({
        current24h: 1,
        previous24h: 0,
        change: 1,
        changePercent: 0,
        sentiment: expect.objectContaining({
          positive: expect.any(Number),
          negative: expect.any(Number),
          neutral: expect.any(Number)
        }),
        totalReach: expect.any(Number),
        topMentions: expect.arrayContaining([
          expect.objectContaining({
            platform: 'twitter',
            content: 'Test tweet about TESTTOKEN',
            engagement: 42 // 10 + 25 + 5 + 2
          })
        ])
      }));

      expect(console.warn).toHaveBeenCalledWith('⚠️ Xai API failed, falling back to Twitter API:', expect.any(Error));
      expect(console.log).toHaveBeenCalledWith('🐦 Using Twitter API for social mentions...');
    });
  });

  describe('searchMentions with Twitter API only', () => {
    beforeEach(() => {
      service = new SocialMentionsService(undefined, 'test-twitter-token');
    });

    it('should successfully search mentions using Twitter API', async () => {
      const mockTwitterResponse = {
        data: {
          data: [
            {
              id: '1',
              text: 'Bullish on TESTTOKEN! 🚀',
              created_at: new Date().toISOString(),
              author_id: 'user1',
              public_metrics: {
                retweet_count: 15,
                like_count: 30,
                reply_count: 8,
                quote_count: 3
              }
            }
          ],
          includes: {
            users: [
              {
                id: 'user1',
                public_metrics: {
                  followers_count: 5000
                }
              }
            ]
          }
        }
      };

      (mockedAxios.get as any).mockResolvedValue(mockTwitterResponse);

      const result = await service.searchMentions('TESTTOKEN', '24h');

      expect(result).toEqual(expect.objectContaining({
        current24h: 1,
        previous24h: 0,
        change: 1,
        changePercent: 0,
        sentiment: expect.objectContaining({
          positive: 1, // Should detect "bullish" as positive
          negative: 0,
          neutral: 0
        }),
        totalReach: expect.any(Number),
        topMentions: expect.arrayContaining([
          expect.objectContaining({
            platform: 'twitter',
            content: 'Bullish on TESTTOKEN! 🚀',
            engagement: 56 // 15 + 30 + 8 + 3
          })
        ])
      }));

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://api.twitter.com/2/tweets/search/recent'),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-twitter-token',
            'Accept': 'application/json'
          }
        })
      );
    });
  });

  describe('searchMentions with no API keys', () => {
    beforeEach(() => {
      service = new SocialMentionsService();
    });

    it('should return empty data when no API keys are available', async () => {
      const result = await service.searchMentions('TESTTOKEN', '24h');

      expect(result).toEqual({
        current24h: 0,
        previous24h: 0,
        change: 0,
        changePercent: 0,
        sentiment: {
          positive: 0,
          negative: 0,
          neutral: 0
        },
        totalReach: 0,
        topMentions: []
      });
    });
  });

  describe('Demo data generation', () => {
    it('should generate consistent demo data based on token address', async () => {
      const service1 = new SocialMentionsService();
      const service2 = new SocialMentionsService();

      // Mock development environment
      const originalEnv = (import.meta as any).env;
      (import.meta as any).env = { DEV: true };

      const result1 = await service1.searchMentions('TESTTOKEN', '24h');
      const result2 = await service2.searchMentions('TESTTOKEN', '24h');

      // Results should be identical for same token
      expect(result1).toEqual(result2);
      
      // Results should be different for different tokens
      const result3 = await service1.searchMentions('OTHERTOKEN', '24h');
      expect(result1.current24h).not.toBe(result3.current24h);

      // Restore original environment
      (import.meta as any).env = originalEnv;
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      service = new SocialMentionsService('test-xai-key', 'test-twitter-token');
      
      // Mock both APIs to fail
      (mockedAxios.post as any).mockRejectedValue(new Error('Network error'));
      (mockedAxios.get as any).mockRejectedValue(new Error('Network error'));

      const result = await service.searchMentions('TESTTOKEN', '24h');

      expect(result).toEqual({
        current24h: 0,
        previous24h: 0,
        change: 0,
        changePercent: 0,
        sentiment: {
          positive: 0,
          negative: 0,
          neutral: 0
        },
        totalReach: 0,
        topMentions: []
      });

      expect(console.warn).toHaveBeenCalledWith('⚠️ No API keys available or all APIs failed. Returning empty social mentions data.');
    });
  });
}); 