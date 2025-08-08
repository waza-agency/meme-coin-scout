import axios from 'axios';
import { Coin, Blockchain } from '../types';
import { apiService } from './api';

interface BlockchainToken {
  address: string;
  symbol: string;
  name: string;
  decimals?: number;
  priority?: 'high' | 'normal';
}

interface CacheEntry {
  data: Coin[];
  timestamp: number;
}

class BlockchainApiService {
  // Get comprehensive token list from blockchain sources - prioritize active trading tokens
  async getAllTokensFromBlockchain(blockchain: Blockchain): Promise<BlockchainToken[]> {
    console.log(`🔗 Fetching tokens from ${blockchain} blockchain sources (prioritizing active trading)...`);
    
    const allTokens: BlockchainToken[] = [];
    const seenAddresses = new Set<string>();

    if (blockchain === 'solana') {
      // SOURCE 1: Raydium pools first (these tokens definitely have trading data)
      const raydiumTokens = await this.fetchRaydiumTokens();
      raydiumTokens.forEach(token => {
        if (!seenAddresses.has(token.address)) {
          seenAddresses.add(token.address);
          allTokens.push({...token, priority: 'high'}); // Mark as high priority
        }
      });

      // SOURCE 2: Jupiter token list (comprehensive but many without trading data)
      const jupiterTokens = await this.fetchJupiterTokens();
      
      // Limit Jupiter tokens to avoid processing too many inactive ones
      const limitedJupiterTokens = jupiterTokens.slice(0, 50000); // First 50K are likely more active
      
      limitedJupiterTokens.forEach(token => {
        if (!seenAddresses.has(token.address)) {
          seenAddresses.add(token.address);
          allTokens.push({...token, priority: 'normal'});
        }
      });

      console.log(`🔗 Total unique tokens from blockchain sources: ${allTokens.length}`);
      console.log(`📊 Sources: Raydium=${raydiumTokens.length}, Jupiter=${limitedJupiterTokens.length}`);
    }

    return allTokens;
  }

  // Smart enrichment with early stopping and prioritization
  async enrichTokensWithMarketData(
    tokens: BlockchainToken[], 
    blockchain: Blockchain, 
    targetResultCount: number = 1000
  ): Promise<Coin[]> {
    console.log(`💎 Smart enrichment: Processing ${tokens.length} tokens, targeting ${targetResultCount} results...`);
    
    const enrichedTokens: Coin[] = [];
    const batchSize = 10; // Smaller batches for reliability
    let processedCount = 0;
    
    // Prioritize tokens - high priority (Raydium) tokens first
    const prioritizedTokens = this.prioritizeTokens(tokens);
    const tokensToProcess = prioritizedTokens.slice(0, Math.min(prioritizedTokens.length, 5000));
    
    for (let i = 0; i < tokensToProcess.length; i += batchSize) {
      // EARLY STOPPING: If we have enough results, stop processing
      if (enrichedTokens.length >= targetResultCount) {
        console.log(`🎯 Early stopping: Found ${enrichedTokens.length} tokens, stopping enrichment`);
        break;
      }
      
      const batch = tokensToProcess.slice(i, i + batchSize);
      const batchNum = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(tokensToProcess.length/batchSize);
      
      console.log(`Processing batch ${batchNum}/${totalBatches} (${enrichedTokens.length} results so far)`);
      
      const batchPromises = batch.map(token => 
        this.enrichSingleTokenWithCache(token, blockchain)
      );
      
      const results = await Promise.allSettled(batchPromises);
      
      let batchSuccesses = 0;
      let batchFailures = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          enrichedTokens.push(...result.value);
          if (result.value.length > 0) {
            batchSuccesses++;
          }
        } else {
          batchFailures++;
        }
      });

      processedCount += batch.length;
      
      // Detailed progress update
      console.log(`📊 Batch ${batchNum} complete: +${batchSuccesses} successes, ${batchFailures} failures`);
      console.log(`📊 Running totals: ${enrichedTokens.length} tradeable tokens from ${processedCount} processed`);

      // Small delay between batches to be respectful to APIs
      if (i + batchSize < tokensToProcess.length && enrichedTokens.length < targetResultCount) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Slightly longer delay
      }
    }

    console.log(`💎 Smart enrichment complete: ${enrichedTokens.length} tokens enriched from ${processedCount} processed`);
    return enrichedTokens;
  }

  // Prioritize tokens - put high-priority (active trading) tokens first
  private prioritizeTokens(tokens: BlockchainToken[]): BlockchainToken[] {
    return tokens.sort((a, b) => {
      // First priority: tokens marked as 'high' priority (from Raydium)
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      
      // Second priority: tokens with real symbols over "Unknown"
      if (a.symbol !== 'Unknown' && b.symbol === 'Unknown') return -1;
      if (a.symbol === 'Unknown' && b.symbol !== 'Unknown') return 1;
      
      // Third priority: shorter addresses (often older/more established)
      const aLen = a.address.length;
      const bLen = b.address.length;
      if (aLen !== bLen) return aLen - bLen;
      
      return 0;
    });
  }

  // Enrich a single token with DexScreener data (with caching and expiration)
  private async enrichSingleTokenWithCache(token: BlockchainToken, blockchain: Blockchain): Promise<Coin[]> {
    const cacheKey = `enrich_${token.address}`;
    const currentTime = Date.now();
    
    // Check cache first and validate expiration
    const cached = this.enrichmentCache.get(cacheKey);
    if (cached) {
      const cacheAge = currentTime - cached.timestamp;
      if (cacheAge < this.CACHE_EXPIRATION_MS) {
        // Cache is still fresh, return cached data
        return cached.data;
      } else {
        // Cache is stale, remove it
        this.enrichmentCache.delete(cacheKey);
        console.log(`🔄 Cache expired for token ${token.symbol}, refreshing...`);
      }
    }
    
    try {
      const marketData = await apiService.searchByContractAddress(token.address);
      
      let result: Coin[] = [];
      if (marketData.length > 0) {
        // Filter for the correct blockchain
        result = marketData.filter(coin => 
          coin.chainId === blockchain || 
          coin.chainId === this.mapBlockchainToChainId(blockchain)
        );
      }
      
      // Cache the result with timestamp (even if empty) to avoid re-querying
      this.enrichmentCache.set(cacheKey, {
        data: result,
        timestamp: currentTime
      });
      return result;
    } catch (error) {
      // Cache empty result with timestamp to avoid retrying failed requests
      this.enrichmentCache.set(cacheKey, {
        data: [],
        timestamp: currentTime
      });
      return [];
    }
  }

  // Simple in-memory cache for enriched tokens with expiration
  private enrichmentCache = new Map<string, CacheEntry>();
  // Cache expiration time in milliseconds (5 minutes)
  private readonly CACHE_EXPIRATION_MS = 5 * 60 * 1000;
  
  // Method to clean up expired cache entries (can be called periodically)
  public cleanupExpiredCache(): number {
    const currentTime = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.enrichmentCache.entries()) {
      const cacheAge = currentTime - entry.timestamp;
      if (cacheAge >= this.CACHE_EXPIRATION_MS) {
        this.enrichmentCache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
    }
    
    return cleanedCount;
  }
  
  // Method to clear entire cache (useful for manual refresh)
  public clearCache(): void {
    const size = this.enrichmentCache.size;
    this.enrichmentCache.clear();
    console.log(`🗑️ Cleared ${size} cache entries`);
  }

  // Fetch tokens from Jupiter (comprehensive Solana token list)
  private async fetchJupiterTokens(): Promise<BlockchainToken[]> {
    try {
      console.log('📋 Fetching Jupiter token list...');
      const response = await axios.get('https://token.jup.ag/all', {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MemeScreener/1.0'
        }
      });
      
      const jupiterTokens: BlockchainToken[] = response.data.map((token: any) => ({
        address: token.address,
        symbol: token.symbol || 'Unknown',
        name: token.name || token.symbol || 'Unknown',
        decimals: token.decimals
      }));

      console.log(`📋 Jupiter: Found ${jupiterTokens.length} tokens`);
      return jupiterTokens;
    } catch (error) {
      console.error('❌ Error fetching Jupiter tokens:', error);
      return [];
    }
  }

  // Fetch tokens from Raydium pools
  private async fetchRaydiumTokens(): Promise<BlockchainToken[]> {
    try {
      console.log('🌊 Fetching Raydium pool tokens...');
      const response = await axios.get('https://api.raydium.io/v2/sdk/liquidity/mainnet.json', {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MemeScreener/1.0'
        }
      });
      
      const raydiumTokens: BlockchainToken[] = [];
      const seenTokens = new Set<string>();
      
      // Extract unique tokens from all liquidity pools
      response.data.official?.forEach((pool: any) => {
        [pool.baseMint, pool.quoteMint].forEach((mint: string) => {
          if (mint && !seenTokens.has(mint)) {
            seenTokens.add(mint);
            raydiumTokens.push({
              address: mint,
              symbol: 'Unknown', // We'll get this from DexScreener
              name: 'Unknown'
            });
          }
        });
      });

      response.data.unOfficial?.forEach((pool: any) => {
        [pool.baseMint, pool.quoteMint].forEach((mint: string) => {
          if (mint && !seenTokens.has(mint)) {
            seenTokens.add(mint);
            raydiumTokens.push({
              address: mint,
              symbol: 'Unknown',
              name: 'Unknown'
            });
          }
        });
      });

      console.log(`🌊 Raydium: Found ${raydiumTokens.length} unique tokens from pools`);
      return raydiumTokens;
    } catch (error) {
      console.error('❌ Error fetching Raydium tokens:', error);
      return [];
    }
  }

  // Map our blockchain names to DexScreener chain IDs
  private mapBlockchainToChainId(blockchain: Blockchain): string {
    const mapping: Record<Blockchain, string> = {
      'solana': 'solana',
      'base': 'base',
      'sui': 'sui', 
      'tron': 'tron'
    };
    return mapping[blockchain] || blockchain;
  }

  // Main method to get all tokens with market data
  async getAllTokensWithMarketData(blockchain: Blockchain, targetResults: number = 500): Promise<Coin[]> {
    try {
      console.log(`🚀 Starting optimized blockchain-native discovery for ${blockchain}...`);
      console.log(`🎯 Target: ${targetResults} tradeable tokens`);
      
      // Step 1: Get all tokens from blockchain sources
      const blockchainTokens = await this.getAllTokensFromBlockchain(blockchain);
      
      if (blockchainTokens.length === 0) {
        console.log('⚠️ No tokens found from blockchain sources, falling back to DexScreener search');
        return await apiService.searchPairsForBlockchain(blockchain, 'SOL');
      }

      // Step 2: Smart enrichment with early stopping
      const enrichedTokens = await this.enrichTokensWithMarketData(blockchainTokens, blockchain, targetResults);
      
      console.log(`✅ Optimized discovery complete: ${enrichedTokens.length} tradeable tokens found`);
      console.log(`⚡ Efficiency: Only processed ${Math.min(blockchainTokens.length, targetResults * 2)} tokens instead of all ${blockchainTokens.length}`);
      
      return enrichedTokens;
      
    } catch (error) {
      console.error(`❌ Error in blockchain-native token discovery:`, error);
      throw error;
    }
  }
}

export const blockchainApiService = new BlockchainApiService();