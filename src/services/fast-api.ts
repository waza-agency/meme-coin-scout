import axios from 'axios';
import { Coin, Blockchain } from '../types';
import { BLOCKCHAIN_CONFIGS, CORS_PROXIES } from '../config/blockchains';

class FastApiService {
  private corsProxyIndex = 0;

  private getCorsProxy(): string {
    return CORS_PROXIES[this.corsProxyIndex];
  }

  private switchCorsProxy(): void {
    this.corsProxyIndex = (this.corsProxyIndex + 1) % CORS_PROXIES.length;
  }

  private async makeRequest(url: string): Promise<any> {
    const maxRetries = CORS_PROXIES.length;
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const corsProxy = this.getCorsProxy();
        const proxiedUrl = corsProxy + encodeURIComponent(url);
        
        const response = await axios.get(proxiedUrl, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        // Handle CORS proxy response formats
        if (response.data && typeof response.data === 'object') {
          if (response.data.contents) {
            try {
              // Attempt to parse the contents as JSON
              return JSON.parse(response.data.contents);
            } catch (parseError) {
              console.error('Failed to parse JSON from CORS proxy response:', parseError);
              console.log('Raw contents:', response.data.contents);
              // If parsing fails, return the raw contents or throw error
              throw new Error(`Invalid JSON in API response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }
          } else if (response.data.pairs || response.data.schemaVersion) {
            return response.data;
          }
        }

        return response.data;
      } catch (error) {
        lastError = error as Error;
        this.switchCorsProxy();
        if (i === maxRetries - 1) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    throw lastError || new Error('All CORS proxies failed');
  }

  // Get ALL tokens for a blockchain using DexScreener's comprehensive data endpoints
  async getAllTokensForBlockchain(blockchain: Blockchain): Promise<Coin[]> {
    console.log(`🚀 Comprehensive discovery: Getting ALL active pairs for ${blockchain}...`);
    
    const allTokens: Coin[] = [];
    const seenContracts = new Set<string>();

    try {
      // STRATEGY 1: Get trending/active pairs (this should give us the most comprehensive data)
      const trendingPairs = await this.fetchTrendingPairs(blockchain);
      console.log(`📊 Trending pairs: ${trendingPairs.length} tokens`);
      
      // STRATEGY 2: Get new pairs (catches recently launched tokens)
      const newPairs = await this.fetchNewPairs(blockchain);
      console.log(`📊 New pairs: ${newPairs.length} tokens`);
      
      // STRATEGY 3: Get pairs by volume (catches active trading)
      const volumePairs = await this.fetchPairsByVolume(blockchain);
      console.log(`📊 Volume-based pairs: ${volumePairs.length} tokens`);

      // Combine all sources
      const combinedTokens = [...trendingPairs, ...newPairs, ...volumePairs];

      // Deduplicate by contract address
      combinedTokens.forEach(token => {
        const contractAddress = token.baseToken?.address;
        if (contractAddress && !seenContracts.has(contractAddress)) {
          seenContracts.add(contractAddress);
          allTokens.push(token);
        }
      });

      console.log(`✅ Comprehensive discovery complete: ${allTokens.length} unique tokens found`);
      return allTokens;

    } catch (error) {
      console.error('❌ Comprehensive discovery failed:', error);
      throw error;
    }
  }

  // Helper method to fetch tokens by endpoint and address field
  private async fetchTokensByEndpoint(
    blockchain: Blockchain,
    endpoint: string,
    addressField: string,
    errorMessage: string
  ): Promise<Coin[]> {
    const blockchainConfig = BLOCKCHAIN_CONFIGS[blockchain];
    const results: Coin[] = [];

    try {
      // Fetch data from the specified endpoint
      const data = await this.makeRequest(endpoint);
      if (Array.isArray(data)) {
        // Filter items for the specified blockchain
        const chainItems = data.filter((item: any) => 
          item.chainId === blockchainConfig.chainId || item.chainId === blockchain
        );

        // Fetch token data for each item
        for (const item of chainItems) {
          try {
            const tokenAddress = item[addressField];
            if (!tokenAddress) continue;
            
            const tokenData = await this.makeRequest(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
            if (tokenData.pairs) {
              results.push(...tokenData.pairs.filter((pair: any) => 
                pair.chainId === blockchainConfig.chainId || pair.chainId === blockchain
              ));
            }
          } catch (e) {
            // Skip failed tokens - continue processing others
          }
        }
      }

      return results;
    } catch (error) {
      console.error(errorMessage, error);
      return [];
    }
  }

  // Fetch trending/popular pairs using DexScreener's actual data endpoints
  private async fetchTrendingPairs(blockchain: Blockchain): Promise<Coin[]> {
    return this.fetchTokensByEndpoint(
      blockchain,
      'https://api.dexscreener.com/token-boosts/top/v1',
      'tokenAddress',
      '❌ Error fetching trending pairs:'
    );
  }

  // Fetch new pairs - recently launched tokens
  private async fetchNewPairs(blockchain: Blockchain): Promise<Coin[]> {
    return this.fetchTokensByEndpoint(
      blockchain,
      'https://api.dexscreener.com/token-profiles/latest/v1',
      'tokenAddress',
      '❌ Error fetching new pairs:'
    );
  }

  // Fetch pairs by volume/activity - this should get us many active tokens
  private async fetchPairsByVolume(blockchain: Blockchain): Promise<Coin[]> {
    const blockchainConfig = BLOCKCHAIN_CONFIGS[blockchain];
    const results: Coin[] = [];

    // The key insight: search for major trading pairs using quote tokens
    // This gives us the most active tokens without hardcoding specific names
    const majorQuoteTokens = blockchainConfig.quoteTokens; // SOL, USDC, USDT

    for (const quote of majorQuoteTokens) {
      try {
        const searchUrl = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(quote)}`;
        const data = await this.makeRequest(searchUrl);
        
        if (data.pairs && Array.isArray(data.pairs)) {
          const chainPairs = data.pairs.filter((pair: any) => 
            pair.chainId === blockchainConfig.chainId || 
            pair.chainId === blockchain
          );
          results.push(...chainPairs);
        }
      } catch (error) {
        console.error(`❌ Failed to search for ${quote}:`, error);
      }
    }

    return results;
  }


}

export const fastApiService = new FastApiService();