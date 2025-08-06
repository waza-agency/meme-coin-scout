import axios from 'axios';
import { SocialMentionsData } from '../types';
import { cacheService, CACHE_TTL } from './cache';
import { redditMentionsService } from './reddit-mentions';
// import { authenticatedRedditService } from './reddit-authenticated'; // Disabled - browser compatibility issues

// const X_API_BASE_URL = 'https://api.x.com/2'; // Kept for future premium features

export class SocialMentionsService {
  private twitterBearerToken: string = '';
  private proxyBaseUrl: string = 'http://localhost:3007';
  private isProxyAvailable: boolean = false;
  private lastProxyCheck: number = 0;
  private proxyCheckInterval: number = 30000; // 30 seconds
  private useRedditAsPrimary: boolean = true; // Feature flag for Reddit vs Twitter

  constructor(twitterBearerToken?: string) {
    // Check environment variables for social media preferences
    const useReddit = (import.meta as any).env?.VITE_USE_REDDIT_SOCIAL !== 'false';
    this.useRedditAsPrimary = useReddit;

    // Get Twitter Bearer token and decode if needed
    let token = twitterBearerToken || (import.meta as any).env?.VITE_TWITTER_BEARER_TOKEN || '';
    try {
      // Decode URL-encoded token if necessary
      this.twitterBearerToken = decodeURIComponent(token);
    } catch {
      // If decode fails, use original token
      this.twitterBearerToken = token;
    }
    
    console.log('🔑 Social Mentions API Configuration:');
    console.log('- Primary source:', this.useRedditAsPrimary ? 'Reddit (Free)' : 'Twitter (Premium)');
    console.log('- Twitter Bearer token exists:', !!this.twitterBearerToken);
    console.log('- Twitter Bearer token length:', this.twitterBearerToken ? this.twitterBearerToken.length : 0);
    
    if (this.useRedditAsPrimary) {
      console.log('✅ Using Reddit as primary social mentions source (free)');
      console.log('💡 Twitter will be used as fallback if available');
    } else if (!this.twitterBearerToken) {
      console.warn('⚠️ No Twitter Bearer Token found for social mentions.');
      console.log('💡 To enable Twitter social mentions:');
      console.log('1. Get a Twitter API Bearer Token from https://developer.twitter.com');
      console.log('2. Add it to .env.local as: VITE_TWITTER_BEARER_TOKEN=your_token');
      console.log('3. Set VITE_USE_REDDIT_SOCIAL=false to use Twitter as primary');
      console.log('4. Restart both the dev server and backend proxy');
      console.log('5. Run: npm run dev:full (to start both frontend and backend)');
    }
    
    // Check proxy availability on startup (only if using Twitter)
    if (!this.useRedditAsPrimary || this.twitterBearerToken) {
      this.checkProxyAvailability();
    }
  }

  private async checkProxyAvailability(): Promise<boolean> {
    const now = Date.now();
    
    // Cache proxy status for 30 seconds to avoid excessive requests
    if (now - this.lastProxyCheck < this.proxyCheckInterval) {
      return this.isProxyAvailable;
    }
    
    try {
      const response = await axios.get(`${this.proxyBaseUrl}/api/health`, { 
        timeout: 3000 
      });
      this.isProxyAvailable = response.status === 200;
      console.log(`✅ Backend proxy is available at ${this.proxyBaseUrl}`);
    } catch (error) {
      this.isProxyAvailable = false;
      console.warn(`⚠️ Backend proxy not available at ${this.proxyBaseUrl}`);
      console.log('💡 To fix: run "npm run server" in a separate terminal');
    }
    
    this.lastProxyCheck = now;
    return this.isProxyAvailable;
  }

  /**
   * Search for social mentions with Reddit as primary source and Twitter as fallback
   * Returns null if no social data is available from any source
   */
  async searchMentions(query: string, timeframe: '24h' | '7d' = '24h'): Promise<SocialMentionsData | null> {
    // Check cache first
    const cacheKey = cacheService.generateKey('social', query, timeframe);
    const cachedData = cacheService.get<SocialMentionsData | null>(cacheKey);
    
    if (cachedData !== null) {
      console.log(`💰 Cache hit for social mentions: ${query}`);
      return cachedData;
    }
    
    console.log(`🔍 Searching social mentions for: ${query} (${timeframe})`);

    // Primary: Try public Reddit API (authenticated Reddit disabled due to browser compatibility)
    if (this.useRedditAsPrimary) {
      try {
        console.log('🎯 Attempting Reddit social mentions...');
        
        // Use public Reddit API
        const redditResult = await redditMentionsService.searchMentions(query, timeframe);
        
        if (redditResult && redditResult.current24h > 0) {
          console.log(`✅ Reddit data retrieved for ${query}:`, redditResult);
          cacheService.set(cacheKey, redditResult, CACHE_TTL.SOCIAL_MENTIONS);
          console.log(`📦 Cached Reddit mentions for ${query}`);
          return redditResult;
        }
        
        console.log('📭 No Reddit mentions found, trying Twitter fallback...');
      } catch (error: any) {
        console.warn(`⚠️ Reddit search failed for ${query}:`, error.message);
        console.log('🔄 Falling back to Twitter API...');
      }
    }

    // Fallback: Try Twitter if Reddit failed or if Twitter is primary
    if (this.twitterBearerToken) {
      // Check if proxy is available first
      const proxyAvailable = await this.checkProxyAvailability();
      
      if (!proxyAvailable) {
        console.warn('❌ Backend proxy not available for Twitter - cannot fetch Twitter mentions');
        console.log('💡 Start backend proxy with: npm run server');
        
        // If Reddit also failed, cache null and return
        if (this.useRedditAsPrimary) {
          cacheService.set(cacheKey, null, 120000);
          return null;
        }
      } else {
        try {
          console.log('🐦 Using Twitter API via backend proxy...');
          const twitterResult = await this.getTwitterSocialData(query, timeframe);
          console.log(`✅ Twitter API data retrieved for ${query}:`, twitterResult);
          
          // Cache the result for 15 minutes
          cacheService.set(cacheKey, twitterResult, CACHE_TTL.SOCIAL_MENTIONS);
          console.log(`📦 Cached Twitter mentions for ${query} (15 min TTL)`);
          
          return twitterResult;
        } catch (error: any) {
          console.warn(`⚠️ Twitter API failed for ${query}:`, error.message || error);
          
          // Provide specific error guidance
          if (error.message?.includes('INVALID_TWITTER_TOKEN')) {
            console.error('🔑 Invalid Twitter token. Please get a valid token from https://developer.twitter.com');
          } else if (error.message?.includes('TWITTER_RATE_LIMIT') || error.message?.includes('429')) {
            console.error('⏱️ Twitter rate limit exceeded (15 requests per 15 minutes). Try again later.');
            // Cache null for longer when rate limited
            cacheService.set(cacheKey, null, 900000); // 15 minutes
            return null;
          } else if (error.message?.includes('PROXY_NOT_RUNNING')) {
            console.error('🔌 Backend proxy not running. Start with: npm run server');
          } else if (error.message?.includes('401')) {
            console.error('🔑 Twitter API authentication failed - token may be invalid or expired');
          } else if (error.message?.includes('403')) {
            console.error('🚫 Twitter API access forbidden - check token permissions');
          }
        }
      }
    } else if (!this.useRedditAsPrimary) {
      console.warn('⚠️ No Twitter Bearer Token available');
      console.log('💡 Set VITE_USE_REDDIT_SOCIAL=true to use Reddit instead');
    }
    
    // If both Reddit and Twitter failed, cache null result for 5 minutes
    console.warn('❌ All social mention sources failed');
    cacheService.set(cacheKey, null, 300000);
    return null;
  }


  /**
   * Get Twitter social data using Twitter API v2 via backend proxy
   */
  private async getTwitterSocialData(query: string, _timeframe: '24h' | '7d' = '24h'): Promise<SocialMentionsData> {
    const searchQuery = `${query} -is:retweet lang:en`;
    const maxResults = Math.min(100, 50); // Reduce to 50 to be gentler on API limits
    
    console.log('🐦 Twitter API request details:');
    console.log('- Query:', searchQuery);
    console.log('- Max results:', maxResults);
    console.log('- Using backend proxy for CORS-free access');
    
    try {
      // Use backend proxy to avoid CORS issues
      const response = await axios.get(`${this.proxyBaseUrl}/api/twitter/search`, {
        params: {
          query: searchQuery,
          max_results: maxResults,
          tweet_fields: 'created_at,public_metrics,text,context_annotations,author_id'
        },
        timeout: 25000, // Increased timeout for better reliability
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const tweets = response.data.data || [];
      const meta = response.data.meta || {};
      
      console.log(`✅ Twitter API success: Found ${tweets.length} tweets`);
      console.log(`📊 API usage: ${meta.result_count || tweets.length} results`);
      
      if (tweets.length === 0) {
        console.log(`📭 No recent tweets found for "${query}"`);
        return {
          current24h: 0,
          previous24h: 0,
          change: 0,
          changePercent: 0,
          sentiment: { positive: 0, negative: 0, neutral: 0 },
          totalReach: 0,
          topMentions: []
        };
      }
      
      // Analyze sentiment based on tweet content
      let positive = 0;
      let negative = 0;
      let neutral = 0;
      let totalReach = 0;
      let totalEngagement = 0;
      
      // Enhanced sentiment keywords
      const positiveKeywords = ['bull', 'moon', '🚀', '💎', 'buy', 'hodl', 'gem', 'bullish', 'pump', 'lambo', 'to the moon', 'diamond hands'];
      const negativeKeywords = ['bear', 'dump', 'rug', 'scam', 'sell', 'crash', 'bearish', 'dead', 'rip', 'exit', 'ponzi', 'fraud'];
      
      const topMentions = tweets.slice(0, 5).map((tweet: any) => {
        const engagement = (tweet.public_metrics?.like_count || 0) + 
                          (tweet.public_metrics?.retweet_count || 0) + 
                          (tweet.public_metrics?.reply_count || 0);
        totalEngagement += engagement;
        
        return {
          platform: 'twitter',
          content: tweet.text?.substring(0, 200) || '', // Truncate long tweets
          engagement,
          timestamp: new Date(tweet.created_at).getTime()
        };
      });
      
      tweets.forEach((tweet: any) => {
        const text = (tweet.text || '').toLowerCase();
        const reach = tweet.public_metrics?.impression_count || 
                     (tweet.public_metrics?.like_count || 0) * 10; // Estimate reach
        totalReach += reach;
        
        // Enhanced sentiment analysis
        const hasPositive = positiveKeywords.some(keyword => text.includes(keyword));
        const hasNegative = negativeKeywords.some(keyword => text.includes(keyword));
        
        if (hasPositive && !hasNegative) {
          positive++;
        } else if (hasNegative && !hasPositive) {
          negative++;
        } else {
          neutral++;
        }
      });

      const current24h = tweets.length;
      
      console.log(`📈 Sentiment analysis for ${query}:`);
      console.log(`- Positive: ${positive} (${((positive/current24h)*100).toFixed(1)}%)`);
      console.log(`- Negative: ${negative} (${((negative/current24h)*100).toFixed(1)}%)`);
      console.log(`- Neutral: ${neutral} (${((neutral/current24h)*100).toFixed(1)}%)`);
      console.log(`- Total reach: ${totalReach.toLocaleString()}`);
      console.log(`- Avg engagement: ${(totalEngagement/tweets.length).toFixed(1)}`);

      return {
        current24h,
        previous24h: 0, // Would need historical data - could implement later
        change: 0,
        changePercent: 0,
        sentiment: { positive, negative, neutral },
        totalReach,
        topMentions
      };
      
    } catch (error: any) {
      console.error('🚨 Twitter API proxy request failed:');
      console.error('- Status:', error.response?.status);
      console.error('- Status Text:', error.response?.statusText);
      console.error('- Data:', error.response?.data);
      console.error('- Message:', error.message);
      
      // Enhanced error handling with specific guidance
      if (error.response?.status === 401) {
        console.error('🔑 Twitter authentication failed');
        console.error('💡 Your Twitter Bearer Token is invalid or expired');
        console.error('🔧 Get a new token from: https://developer.twitter.com/en/portal/dashboard');
        throw new Error('INVALID_TWITTER_TOKEN: Authentication failed. Token invalid or expired.');
      } else if (error.response?.status === 403) {
        console.error('🚫 Twitter access forbidden');
        console.error('💡 Your token may lack required permissions or your app may be suspended');
        throw new Error('TWITTER_FORBIDDEN: Access forbidden. Check token permissions or app status.');
      } else if (error.response?.status === 429) {
        console.error('⏱️ Twitter rate limit exceeded');
        console.error('💡 Twitter allows 15 requests per 15 minutes for search');
        console.error('⏳ Wait 15 minutes or upgrade to a higher tier plan');
        throw new Error('TWITTER_RATE_LIMIT: Rate limit exceeded. Wait 15 minutes.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        console.error('🔌 Cannot connect to backend proxy');
        console.error('💡 Start the backend proxy: npm run server');
        throw new Error('PROXY_NOT_RUNNING: Backend proxy not running. Start with: npm run server');
      } else if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND')) {
        console.error('🌐 Network connectivity issue');
        throw new Error('NETWORK_ERROR: Cannot connect to Twitter API. Check internet connection.');
      } else if (error.response?.data?.errors?.[0]?.message) {
        const twitterError = error.response.data.errors[0].message;
        console.error('🐦 Twitter API error:', twitterError);
        throw new Error(`TWITTER_ERROR: ${twitterError}`);
      } else if (error.response?.data?.detail) {
        console.error('🐦 Twitter API detail:', error.response.data.detail);
        throw new Error(`TWITTER_ERROR: ${error.response.data.detail}`);
      }
      
      // Generic error
      throw new Error(`TWITTER_API_ERROR: ${error.message || 'Unknown error occurred'}`);
    }
  }


  /**
   * Validate and normalize social data from API - NO MOCK DATA
   * Currently unused but kept for potential future data validation needs
   */
  /* private validateAndNormalizeSocialData(data: any): SocialMentionsData {
    return {
      current24h: Math.max(0, parseInt(data.current24h) || 0),
      previous24h: Math.max(0, parseInt(data.previous24h) || 0),
      change: parseInt(data.change) || 0,
      changePercent: Math.round((parseFloat(data.changePercent) || 0) * 10) / 10,
      sentiment: {
        positive: Math.max(0, parseInt(data.sentiment?.positive) || 0),
        negative: Math.max(0, parseInt(data.sentiment?.negative) || 0),
        neutral: Math.max(0, parseInt(data.sentiment?.neutral) || 0)
      },
      totalReach: Math.max(0, parseInt(data.totalReach) || 0),
      topMentions: Array.isArray(data.topMentions) ? data.topMentions.slice(0, 5) : []
    };
  } */
}

// Export singleton instance
export const socialMentionsService = new SocialMentionsService();