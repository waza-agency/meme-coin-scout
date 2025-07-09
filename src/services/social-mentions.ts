import axios from 'axios';
import { SocialMentionsData } from '../types';

const X_API_BASE_URL = 'https://api.twitter.com/2';

export class SocialMentionsService {
  private bearerToken: string = '';

  constructor(bearerToken?: string) {
    this.bearerToken = bearerToken || (import.meta as any).env?.VITE_X_BEARER_TOKEN || '';
    
    console.log('🔑 X API Configuration Check:');
    console.log('- Bearer token exists:', !!this.bearerToken);
    console.log('- Bearer token length:', this.bearerToken ? this.bearerToken.length : 0);
    console.log('- import.meta.env.VITE_X_BEARER_TOKEN exists:', !!(import.meta as any).env?.VITE_X_BEARER_TOKEN);
    
    if (!this.bearerToken) {
      console.error('❌ X API Bearer Token is required. Please set VITE_X_BEARER_TOKEN environment variable.');
      console.log('💡 To fix this:');
      console.log('1. Make sure you have a .env file in the project root');
      console.log('2. Add: VITE_X_BEARER_TOKEN=your_actual_bearer_token');
      console.log('3. Restart the dev server');
    }
  }

  /**
   * Search for social mentions using X (Twitter) API v2
   */
  async searchMentions(query: string, timeframe: '24h' | '7d' = '24h'): Promise<SocialMentionsData> {
    console.log(`🔍 Searching X mentions for: ${query}`);
    console.log('🔑 Bearer token available:', !!this.bearerToken);
    
    if (!this.bearerToken) {
      console.warn('⚠️ No X API Bearer Token found. Returning empty social mentions data.');
      return this.getEmptySocialMentionsData(query);
    }

    const now = new Date();
    const timeframeDuration = timeframe === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const startTime = new Date(now.getTime() - timeframeDuration);
    const previousStartTime = new Date(startTime.getTime() - timeframeDuration);

    try {
      console.log(`🌐 Making X API requests for ${query}...`);
      
      // Search for current period mentions
      const currentMentions = await this.searchXAPI(query, startTime, now);
      
      // Search for previous period mentions for comparison
      const previousMentions = await this.searchXAPI(query, previousStartTime, startTime);

      const result = this.parseXAPIResponse(currentMentions, previousMentions);
      console.log(`✅ X mentions data retrieved for ${query}:`, result);
      return result;
    } catch (error: any) {
      console.error(`❌ Failed to fetch X mentions for ${query}:`, error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request made but no response received:', error.request);
      } else {
        console.error('Error setting up the request:', error.message);
      }
      
      // Return empty data instead of throwing
      console.log('📊 Returning empty social mentions data due to API error');
      return this.getEmptySocialMentionsData(query);
    }
  }

  /**
   * Search X API for tweets
   */
  private async searchXAPI(query: string, startTime: Date, endTime: Date): Promise<any> {
    // Build comprehensive search query
    const searchQuery = this.buildSearchQuery(query);
    
    const params = new URLSearchParams({
      query: searchQuery,
      'tweet.fields': 'created_at,author_id,public_metrics,text,context_annotations,lang',
      'user.fields': 'public_metrics',
      'expansions': 'author_id',
      'start_time': startTime.toISOString(),
      'end_time': endTime.toISOString(),
      'max_results': '100' // Maximum allowed
    });

    const response = await axios.get(`${X_API_BASE_URL}/tweets/search/recent?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Accept': 'application/json',
      },
      timeout: 15000,
    });

    return response.data;
  }

  /**
   * Build comprehensive search query for the token
   */
  private buildSearchQuery(token: string): string {
    const tokenUpper = token.toUpperCase();
    const tokenLower = token.toLowerCase();
    
    // Build query with various token formats and crypto-related context
    const queries = [
      `"${token}"`, // Exact match
      `"${tokenUpper}"`, // Uppercase
      `"$${token}"`, // With dollar sign
      `"$${tokenUpper}"`, // Dollar + uppercase
      `${token} token`, // With "token"
      `${token} coin`, // With "coin"
      `${token} crypto`, // With "crypto"
    ];

    // Combine with OR operators and exclude common noise
    const searchQuery = `(${queries.join(' OR ')}) lang:en -is:retweet`;
    
    return searchQuery;
  }

  /**
   * Parse X API response into our data format
   */
  private parseXAPIResponse(currentData: any, previousData: any): SocialMentionsData {
    const currentTweets = currentData?.data || [];
    const previousTweets = previousData?.data || [];
    const currentUsers = currentData?.includes?.users || [];
    
    const current24h = currentTweets.length;
    const previous24h = previousTweets.length;
    const change = current24h - previous24h;
    const changePercent = previous24h > 0 ? (change / previous24h) * 100 : 0;

    // Analyze sentiment from tweets
    const sentiment = this.analyzeTweetSentiment(currentTweets);

    // Calculate total reach
    const totalReach = this.calculateTotalReach(currentTweets, currentUsers);

    // Extract top mentions
    const topMentions = this.extractTopMentions(currentTweets, currentUsers);

    return {
      current24h,
      previous24h,
      change,
      changePercent,
      sentiment,
      totalReach,
      topMentions,
    };
  }

  /**
   * Analyze sentiment from tweets using advanced keyword analysis
   */
  private analyzeTweetSentiment(tweets: any[]): { positive: number; negative: number; neutral: number } {
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    // Comprehensive crypto-specific sentiment keywords
    const positiveWords = [
      'bullish', 'moon', 'pump', 'rally', 'breakout', 'surge', 'rocket', 'lambo',
      'hold', 'hodl', 'diamond', 'hands', 'buy', 'accumulate', 'long', 'green',
      'profit', 'gain', 'up', 'rise', 'climb', 'soar', 'explode', 'gem',
      'good', 'great', 'amazing', 'awesome', 'love', 'like', 'win', 'success'
    ];

    const negativeWords = [
      'bearish', 'dump', 'crash', 'fall', 'drop', 'red', 'loss', 'lose',
      'scam', 'rug', 'rugpull', 'fraud', 'fake', 'ponzi', 'rekt', 'liquidated',
      'dead', 'worthless', 'trash', 'terrible', 'awful', 'hate', 'avoid',
      'sell', 'short', 'down', 'decline', 'plunge', 'collapse', 'disaster'
    ];

    tweets.forEach((tweet) => {
      const text = (tweet.text || '').toLowerCase();
      
      const positiveCount = positiveWords.filter(word => 
        text.includes(word) || text.includes(`#${word}`)
      ).length;
      
      const negativeCount = negativeWords.filter(word => 
        text.includes(word) || text.includes(`#${word}`)
      ).length;

      if (positiveCount > negativeCount) {
        positive++;
      } else if (negativeCount > positiveCount) {
        negative++;
      } else {
        neutral++;
      }
    });

    return { positive, negative, neutral };
  }

  /**
   * Calculate total reach from tweets and user data
   */
  private calculateTotalReach(tweets: any[], users: any[]): number {
    const userMap = new Map(users.map((user: any) => [user.id, user]));
    
    return tweets.reduce((total, tweet) => {
      const user = userMap.get(tweet.author_id);
      const metrics = tweet.public_metrics || {};
      const userMetrics = user?.public_metrics || {};
      
      const reach = (userMetrics.followers_count || 0) + 
                   (metrics.retweet_count || 0) + 
                   (metrics.like_count || 0) + 
                   (metrics.reply_count || 0) + 
                   (metrics.quote_count || 0);
      
      return total + reach;
    }, 0);
  }

  /**
   * Extract top mentions with engagement metrics
   */
  private extractTopMentions(tweets: any[], users: any[]): Array<{
    platform: string;
    content: string;
    engagement: number;
    timestamp: number;
  }> {
    const userMap = new Map(users.map((user: any) => [user.id, user]));
    
    return tweets
      .map((tweet) => {
        const metrics = tweet.public_metrics || {};
        const engagement = (metrics.retweet_count || 0) + 
                          (metrics.like_count || 0) + 
                          (metrics.reply_count || 0) + 
                          (metrics.quote_count || 0);
        
        return {
          platform: 'twitter',
          content: (tweet.text || '').substring(0, 200),
          engagement,
          timestamp: new Date(tweet.created_at || Date.now()).getTime(),
        };
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5); // Top 5 by engagement
  }

  /**
   * Get empty social mentions data for fallback
   */
  private getEmptySocialMentionsData(tokenAddress?: string): SocialMentionsData {
    // If we're in development and no API key is available, show demo data
    const isDevelopment = (import.meta as any).env?.DEV;
    
    if (isDevelopment && !this.bearerToken) {
      console.log('📊 Showing demo social mentions data (X API not configured)');
      return this.getDemoSocialMentionsData(tokenAddress);
    }
    
    return {
      current24h: 0,
      previous24h: 0,
      change: 0,
      changePercent: 0,
      sentiment: {
        positive: 0,
        negative: 0,
        neutral: 0,
      },
      totalReach: 0,
      topMentions: [],
    };
  }

  /**
   * Simple hash function for consistent demo data
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / Math.pow(2, 31); // Normalize to 0-1
  }

  /**
   * Generate realistic demo data for development
   */
  private getDemoSocialMentionsData(tokenAddress?: string): SocialMentionsData {
    // Create deterministic but varied data based on token address
    const hashValue = tokenAddress ? this.hashString(tokenAddress) : Math.random();
    const seed1 = (hashValue * 1000) % 1;
    const seed2 = (hashValue * 10000) % 1;
    const seed3 = (hashValue * 100000) % 1;
    
    // Generate realistic token-specific data
    const baseActivity = Math.floor(seed1 * 150) + 20; // 20-170 mentions
    const previous = Math.floor(seed2 * 120) + 15; // 15-135 mentions
    const change = baseActivity - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;

    // Generate realistic sentiment distribution based on token
    const total = baseActivity;
    const sentimentRatio = seed3;
    let positive, negative, neutral;
    
    if (sentimentRatio < 0.3) {
      // Negative sentiment dominant
      negative = Math.floor(total * (0.4 + seed1 * 0.3)); // 40-70%
      positive = Math.floor(total * (0.1 + seed2 * 0.2)); // 10-30%
      neutral = total - positive - negative;
    } else if (sentimentRatio > 0.7) {
      // Positive sentiment dominant
      positive = Math.floor(total * (0.4 + seed1 * 0.4)); // 40-80%
      negative = Math.floor(total * (0.05 + seed2 * 0.15)); // 5-20%
      neutral = total - positive - negative;
    } else {
      // Neutral/mixed sentiment
      positive = Math.floor(total * (0.2 + seed1 * 0.3)); // 20-50%
      negative = Math.floor(total * (0.2 + seed2 * 0.3)); // 20-50%
      neutral = total - positive - negative;
    }

    // Generate realistic reach
    const totalReach = Math.floor(seed1 * 50000) + 5000; // 5K-55K reach

    // Generate sample top mentions
    const sampleMentions = [
      "🚀 This token is looking bullish! #crypto #DeFi",
      "Just bought the dip 💎🙌 Long term holder here",
      "Volume is pumping hard today! Something big coming?",
      "Great fundamentals on this project 📈",
      "Community is really strong, love the support ❤️",
      "Bearish signal on the charts 📉 Watch out",
      "Might be a good entry point at these levels",
      "Team is delivering on roadmap consistently 🎯"
    ];

    const mentionCount = Math.floor(seed2 * 4) + 2; // 2-5 mentions
    const topMentions = sampleMentions
      .slice(0, mentionCount)
      .map((content, index) => ({
        platform: 'twitter' as const,
        content,
        engagement: Math.floor(seed3 * 500) + 20,
        timestamp: Date.now() - (index * 3600000), // Spread over hours
      }));

    return {
      current24h: baseActivity,
      previous24h: previous,
      change,
      changePercent: Math.round(changePercent * 10) / 10,
      sentiment: {
        positive: Math.max(0, positive),
        negative: Math.max(0, negative),
        neutral: Math.max(0, neutral),
      },
      totalReach,
      topMentions,
    };
  }
}

// Export singleton instance
export const socialMentionsService = new SocialMentionsService(); 