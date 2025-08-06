import axios from 'axios';
import { SocialMentionsData } from '../types';
import { cacheService, CACHE_TTL } from './cache';

// Cache TTL for error results (5 minutes)
const ERROR_CACHE_TTL = 300000;

// Development-only logging utilities
const devLog = (message: string, ...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log(message, ...args);
  }
};

const devWarn = (message: string, ...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.warn(message, ...args);
  }
};

/**
 * Reddit API integration for social mentions
 * Uses public Reddit JSON API - no authentication required
 */
export class RedditMentionsService {
  private readonly baseUrl = 'https://www.reddit.com';
  private readonly proxyUrl = 'http://localhost:3007/api/reddit/search';
  private readonly useProxy = true; // Use proxy to avoid CORS and rate limits
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
  private readonly requestTimeout = 15000; // 15 seconds
  private readonly maxRetries = 2;

  constructor() {
    devLog('🔥 Reddit Mentions Service initialized');
    devLog(`- Target subreddits: ${this.targetSubreddits.length}`);
    devLog(`- Request timeout: ${this.requestTimeout}ms`);
    devLog('⚠️ Note: Reddit may be rate limiting this IP due to development testing');
  }

  /**
   * Search for crypto mentions across Reddit
   * @param query - Token symbol or name to search for
   * @param timeframe - Time range for search ('24h' or '7d')
   * @returns Promise<SocialMentionsData | null>
   */
  async searchMentions(query: string, timeframe: '24h' | '7d' = '24h'): Promise<SocialMentionsData | null> {
    const cacheKey = cacheService.generateKey('reddit', query, timeframe);
    const cachedData = cacheService.get<SocialMentionsData | null>(cacheKey);
    
    if (cachedData !== null) {
      devLog(`💰 Cache hit for Reddit mentions: ${query}`);
      return cachedData;
    }

    devLog(`🔍 Searching Reddit mentions for: ${query} (${timeframe})`);

    try {
      const redditData = await this.fetchRedditMentions(query, timeframe);
      
      // Cache successful results for 10 minutes
      cacheService.set(cacheKey, redditData, CACHE_TTL.SOCIAL_MENTIONS);
      devLog(`📦 Cached Reddit mentions for ${query} (10 min TTL)`);
      
      return redditData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      devWarn(`⚠️ Reddit search failed for ${query}:`, errorMessage);
      
      // Cache null result for 5 minutes to prevent spam
      cacheService.set(cacheKey, null, ERROR_CACHE_TTL);
      return null;
    }
  }

  /**
   * Fetch mentions from Reddit using multiple search strategies
   */
  private async fetchRedditMentions(query: string, timeframe: '24h' | '7d'): Promise<SocialMentionsData> {
    const searchTerm = this.normalizeQuery(query);
    const timeSort = this.getTimeSort(timeframe);
    
    devLog(`🎯 Reddit search strategy:`);
    devLog(`- Query: ${searchTerm}`);
    devLog(`- Sort: ${timeSort}`);
    devLog(`- Subreddits: ${this.targetSubreddits.length}`);

    // Collect posts from multiple sources
    const allPosts: RedditPost[] = [];
    
    // 1. General Reddit search
    try {
      const generalPosts = await this.searchRedditGeneral(searchTerm, timeSort);
      allPosts.push(...generalPosts);
      devLog(`✅ General search: ${generalPosts.length} posts`);
    } catch (error) {
      devWarn('⚠️ General Reddit search failed:', error);
    }

    // 2. Subreddit-specific searches
    for (const subreddit of this.targetSubreddits.slice(0, 5)) { // Limit to top 5 to avoid rate limits
      try {
        const subredditPosts = await this.searchSubreddit(subreddit, searchTerm, timeSort);
        allPosts.push(...subredditPosts);
        devLog(`✅ r/${subreddit}: ${subredditPosts.length} posts`);
        
        // Small delay to be respectful to Reddit's servers
        await this.delay(200);
      } catch (error) {
        devWarn(`⚠️ r/${subreddit} search failed:`, error);
      }
    }

    // Remove duplicates and analyze
    const uniquePosts = this.removeDuplicatePosts(allPosts);
    devLog(`📊 Total unique posts found: ${uniquePosts.length}`);

    if (uniquePosts.length === 0) {
      return this.getEmptyResult();
    }

    return this.analyzePosts(uniquePosts, query);
  }

  /**
   * Search Reddit generally across all subreddits
   */
  private async searchRedditGeneral(query: string, sort: string): Promise<RedditPost[]> {
    if (this.useProxy) {
      const response = await this.makeRequest(this.proxyUrl, {
        q: query,
        sort,
        limit: 50
      });
      return this.parseRedditResponse(response.data.data);
    } else {
      const url = `${this.baseUrl}/search.json`;
      const params = {
        q: query,
        sort,
        limit: 50,
        restrict_sr: false,
        type: 'link'
      };
      const response = await this.makeRequest(url, params);
      return this.parseRedditResponse(response.data);
    }
  }

  /**
   * Search within a specific subreddit
   */
  private async searchSubreddit(subreddit: string, query: string, sort: string): Promise<RedditPost[]> {
    if (this.useProxy) {
      const response = await this.makeRequest(this.proxyUrl, {
        q: query,
        subreddit,
        sort,
        limit: 25
      });
      return this.parseRedditResponse(response.data.data);
    } else {
      const url = `${this.baseUrl}/r/${subreddit}/search.json`;
      const params = {
        q: query,
        restrict_sr: true,
        sort,
        limit: 25
      };
      const response = await this.makeRequest(url, params);
      return this.parseRedditResponse(response.data);
    }
  }

  /**
   * Make HTTP request to Reddit with retry logic
   */
  private async makeRequest(url: string, params: any, retryCount = 0): Promise<any> {
    try {
      const response = await axios.get(url, {
        params,
        timeout: this.requestTimeout,
        headers: {
          'User-Agent': 'MemeScreener/1.0.0 (Crypto Analysis Tool)',
          'Accept': 'application/json'
        }
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid Reddit API response format');
      }

      return response;
    } catch (error: unknown) {
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        devLog(`🔄 Retrying Reddit request (${retryCount + 1}/${this.maxRetries})...`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.makeRequest(url, params, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Parse Reddit API response into standardized format
   */
  private parseRedditResponse(data: any): RedditPost[] {
    if (!data || !data.children || !Array.isArray(data.children)) {
      return [];
    }

    return data.children.map((child: any) => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title || '',
        content: post.selftext || '',
        author: post.author || 'unknown',
        subreddit: post.subreddit,
        score: post.score || 0,
        upvoteRatio: post.upvote_ratio || 0.5,
        numComments: post.num_comments || 0,
        createdUtc: post.created_utc,
        permalink: post.permalink,
        url: post.url
      };
    }).filter(post => this.isRecentPost(post.createdUtc));
  }

  /**
   * Analyze posts to generate social mentions data
   */
  private analyzePosts(posts: RedditPost[], query: string): SocialMentionsData {
    devLog(`📈 Analyzing ${posts.length} Reddit posts for ${query}...`);

    const sentiment = this.analyzeSentiment(posts);
    const topMentions = this.getTopMentions(posts);

    const current24h = posts.length;
    const totalReach = posts.reduce((sum, post) => sum + (post.score * 10), 0); // Estimate reach

    devLog(`📊 Reddit analysis results:`);
    devLog(`- Posts: ${current24h}`);
    devLog(`- Avg score: ${(posts.reduce((sum, p) => sum + p.score, 0) / posts.length).toFixed(1)}`);
    devLog(`- Avg comments: ${(posts.reduce((sum, p) => sum + p.numComments, 0) / posts.length).toFixed(1)}`);
    devLog(`- Sentiment: ${sentiment.positive}+ ${sentiment.negative}- ${sentiment.neutral}=`);
    devLog(`- Est. reach: ${totalReach.toLocaleString()}`);

    return {
      current24h,
      previous24h: 0, // Would need historical data
      change: 0,
      changePercent: 0,
      sentiment,
      totalReach,
      topMentions
    };
  }

  /**
   * Analyze sentiment of Reddit posts and comments
   */
  private analyzeSentiment(posts: RedditPost[]): { positive: number; negative: number; neutral: number } {
    const positiveKeywords = [
      'moon', 'bullish', 'buy', 'hodl', 'gem', 'pump', 'lambo', 'rocket',
      'diamond', 'hands', 'ape', 'yolo', 'dip', 'accumulate', 'breakout',
      'undervalued', 'potential', 'promising', 'excited', 'love', 'amazing'
    ];

    const negativeKeywords = [
      'dump', 'rug', 'scam', 'bearish', 'sell', 'crash', 'dead', 'rip',
      'exit', 'ponzi', 'fraud', 'shit', 'trash', 'avoid', 'warning',
      'suspicious', 'fake', 'bubble', 'overvalued', 'risky'
    ];

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    posts.forEach((post: RedditPost) => {
      const text = `${post.title} ${post.content}`.toLowerCase();
      const hasPositive = positiveKeywords.some(keyword => text.includes(keyword));
      const hasNegative = negativeKeywords.some(keyword => text.includes(keyword));

      // Weight by post engagement (score + comments)
      const weight = Math.max(1, Math.log(post.score + post.numComments + 1));

      if (hasPositive && !hasNegative) {
        positive += weight;
      } else if (hasNegative && !hasPositive) {
        negative += weight;
      } else {
        neutral += weight;
      }
    });

    // Normalize to integer counts ensuring total equals posts.length
    const total = positive + negative + neutral;
    const normalizedPositive = Math.round((positive / total) * posts.length);
    const normalizedNegative = Math.round((negative / total) * posts.length);
    const normalizedNeutral = posts.length - normalizedPositive - normalizedNegative;
    
    return {
      positive: normalizedPositive,
      negative: normalizedNegative,
      neutral: Math.max(0, normalizedNeutral) // Ensure neutral is never negative
    };
  }

  /**
   * Calculate total engagement metrics
   */
  private calculateEngagement(posts: RedditPost[]): number {
    return posts.reduce((total, post) => {
      return total + post.score + post.numComments;
    }, 0);
  }

  /**
   * Get top mentions for display
   */
  private getTopMentions(posts: RedditPost[]): Array<{
    platform: string;
    content: string;
    engagement: number;
    timestamp: number;
  }> {
    return posts
      .sort((a, b) => (b.score + b.numComments) - (a.score + a.numComments))
      .slice(0, 5)
      .map(post => ({
        platform: `reddit-${post.subreddit}`,
        content: post.title.substring(0, 150) + (post.title.length > 150 ? '...' : ''),
        engagement: post.score + post.numComments,
        timestamp: post.createdUtc * 1000 // Convert to milliseconds
      }));
  }

  /**
   * Remove duplicate posts based on title similarity
   */
  private removeDuplicatePosts(posts: RedditPost[]): RedditPost[] {
    const seen = new Set<string>();
    const unique: RedditPost[] = [];

    posts.forEach(post => {
      const key = post.title.toLowerCase().substring(0, 50); // Use first 50 chars as key
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(post);
      }
    });

    return unique;
  }

  /**
   * Normalize search query for better Reddit search results
   */
  private normalizeQuery(query: string): string {
    // Remove common prefixes and clean up
    return query
      .replace(/^\$/, '') // Remove $ prefix
      .trim()
      .toLowerCase();
  }

  /**
   * Get appropriate sort parameter for timeframe
   */
  private getTimeSort(timeframe: '24h' | '7d'): string {
    return timeframe === '24h' ? 'new' : 'week';
  }

  /**
   * Check if post is recent enough based on timeframe
   */
  private isRecentPost(createdUtc: number): boolean {
    const now = Date.now() / 1000;
    const dayAgo = now - (24 * 60 * 60);
    return createdUtc > dayAgo;
  }

  /**
   * Get empty result structure
   */
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

  /**
   * Determine if error should trigger retry
   */
  private shouldRetry(error: unknown): boolean {
    // Type guard to check if error has expected properties
    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      
      // Check for network error codes
      if (typeof err.code === 'string' && 
          (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
        return true;
      }
      
      // Check for HTTP response errors (axios-like structure)
      if (err.response && typeof err.response === 'object') {
        const response = err.response as Record<string, unknown>;
        if (typeof response.status === 'number') {
          return response.status === 429 || response.status >= 500;
        }
      }
    }
    
    return false;
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Reddit post interface for type safety
 */
interface RedditPost {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  createdUtc: number;
  permalink: string;
  url: string;
}

// Export singleton instance
export const redditMentionsService = new RedditMentionsService();