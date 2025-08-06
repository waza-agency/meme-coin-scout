import Snoowrap from 'snoowrap';
import { SocialMentionsData } from '../types';
import { cacheService, CACHE_TTL } from './cache';

/**
 * Authenticated Reddit API service using snoowrap
 * This provides proper authentication and avoids rate limits
 */
export class AuthenticatedRedditService {
  private reddit: Snoowrap | null = null;
  private readonly targetSubreddits = [
    'cryptocurrency',
    'CryptoMoonShots', 
    'SatoshiStreetBets',
    'CryptoCurrency',
    'altcoin',
    'defi',
    'solana',
    'ethtrader',
    'CryptoMarkets'
  ];

  constructor() {
    this.initializeReddit();
  }

  private initializeReddit() {
    const clientId = (import.meta as any).env?.VITE_REDDIT_CLIENT_ID;
    const clientSecret = (import.meta as any).env?.VITE_REDDIT_CLIENT_SECRET;
    const userAgent = (import.meta as any).env?.VITE_REDDIT_USER_AGENT || 'MemeScreener:v1.0.0';

    if (!clientId || !clientSecret) {
      console.warn('⚠️ Reddit API credentials not configured');
      console.log('💡 Add VITE_REDDIT_CLIENT_ID and VITE_REDDIT_CLIENT_SECRET to .env.local');
      return;
    }

    try {
      // For script-type apps, use client credentials grant
      this.reddit = new Snoowrap({
        userAgent,
        clientId,
        clientSecret,
        grantType: 'client_credentials'
      } as any);

      console.log('✅ Authenticated Reddit API initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Reddit API:', error);
      this.reddit = null;
    }
  }

  async searchMentions(query: string, timeframe: '24h' | '7d' = '24h'): Promise<SocialMentionsData | null> {
    if (!this.reddit) {
      console.warn('⚠️ Reddit API not initialized - missing credentials');
      return null;
    }

    const cacheKey = cacheService.generateKey('reddit-auth', query, timeframe);
    const cachedData = cacheService.get<SocialMentionsData | null>(cacheKey);
    
    if (cachedData !== null) {
      console.log(`💰 Cache hit for authenticated Reddit: ${query}`);
      return cachedData;
    }

    console.log(`🔍 Authenticated Reddit search for: ${query} (${timeframe})`);

    try {
      const allPosts: any[] = [];
      const searchTerm = this.normalizeQuery(query);
      
      // Search top 5 subreddits
      for (const subredditName of this.targetSubreddits.slice(0, 5)) {
        try {
          console.log(`📡 Searching r/${subredditName}...`);
          
          const subreddit = this.reddit.getSubreddit(subredditName);
          
          // Get recent posts
          const posts = await subreddit.getNew({
            limit: 25,
            time: timeframe === '24h' ? 'day' : 'week'
          });
          
          // Filter posts that mention our search term
          const relevantPosts = posts.filter((post: any) => 
            this.postMentionsTerm(post.title, searchTerm) ||
            this.postMentionsTerm(post.selftext || '', searchTerm)
          );

          allPosts.push(...relevantPosts);
          console.log(`✅ r/${subredditName}: Found ${relevantPosts.length} relevant posts`);

          // Small delay to be respectful
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.warn(`⚠️ r/${subredditName} search failed:`, error);
        }
      }

      if (allPosts.length === 0) {
        const emptyResult = this.getEmptyResult();
        cacheService.set(cacheKey, emptyResult, CACHE_TTL.SOCIAL_MENTIONS);
        return emptyResult;
      }

      // Analyze the posts
      const result = this.analyzePosts(allPosts, query);
      
      // Cache for 10 minutes
      cacheService.set(cacheKey, result, CACHE_TTL.SOCIAL_MENTIONS);
      console.log(`📦 Cached authenticated Reddit data for ${query}`);
      
      return result;

    } catch (error: any) {
      console.error('❌ Authenticated Reddit search failed:', error.message);
      
      // Cache null for shorter time on error
      cacheService.set(cacheKey, null, 300000); // 5 minutes
      return null;
    }
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase()
      .replace(/^\$/, '') // Remove $ prefix
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
      .trim();
  }

  private postMentionsTerm(text: string, term: string): boolean {
    if (!text) return false;
    
    const normalizedText = text.toLowerCase();
    return normalizedText.includes(term) || 
           normalizedText.includes(`$${term}`) ||
           normalizedText.includes(`#${term}`) ||
           normalizedText.includes(`${term}coin`) ||
           normalizedText.includes(`${term}token`);
  }

  private analyzePosts(posts: any[], query: string): SocialMentionsData {
    const current24h = posts.length;
    const previous24h = 0; // Would need historical data
    const change = current24h - previous24h;
    const changePercent = previous24h > 0 ? (change / previous24h) * 100 : 0;

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(posts);
    
    // Calculate total reach (estimated)
    const totalReach = posts.reduce((sum: number, post: any) => 
      sum + ((post.score || 0) * 10) + ((post.num_comments || 0) * 5), 0
    );

    // Top mentions
    const topMentions = posts
      .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
      .slice(0, 5)
      .map((post: any) => ({
        platform: `reddit-${post.subreddit?.display_name || 'unknown'}`,
        content: (post.title || '').substring(0, 100) + (post.title?.length > 100 ? '...' : ''),
        engagement: (post.score || 0) + (post.num_comments || 0),
        timestamp: (post.created_utc || 0) * 1000
      }));

    console.log(`📊 Analyzed ${posts.length} posts for ${query}:`, {
      sentiment: `${sentiment.positive}+ ${sentiment.negative}- ${sentiment.neutral}=`,
      totalReach
    });

    return {
      current24h,
      previous24h,
      change,
      changePercent,
      sentiment,
      totalReach,
      topMentions
    };
  }

  private analyzeSentiment(posts: any[]): { positive: number; negative: number; neutral: number } {
    const positiveKeywords = ['moon', 'bullish', 'buy', 'hodl', 'gem', 'pump', 'lambo', 'rocket', 'diamond', 'hands', 'up', 'rise', 'bull'];
    const negativeKeywords = ['dump', 'rug', 'scam', 'bearish', 'sell', 'crash', 'dead', 'fraud', 'ponzi', 'down', 'fall', 'bear'];

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    for (const post of posts) {
      const content = ((post.title || '') + ' ' + (post.selftext || '')).toLowerCase();
      const weight = Math.max(1, (post.score || 0) / 10); // Weight by engagement

      const hasPositive = positiveKeywords.some(keyword => content.includes(keyword));
      const hasNegative = negativeKeywords.some(keyword => content.includes(keyword));

      if (hasPositive && !hasNegative) {
        positive += weight;
      } else if (hasNegative && !hasPositive) {
        negative += weight;
      } else {
        neutral += weight;
      }
    }

    return { 
      positive: Math.round(positive), 
      negative: Math.round(negative), 
      neutral: Math.round(neutral) 
    };
  }

  private getEmptyResult(): SocialMentionsData {
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
}

export const authenticatedRedditService = new AuthenticatedRedditService();