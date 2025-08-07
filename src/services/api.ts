import axios, { AxiosResponse } from 'axios';
import { DexScreenerResponse, Coin, Blockchain } from '../types';
import { BLOCKCHAIN_CONFIGS, CORS_PROXIES } from '../config/blockchains';
import { cacheService, CACHE_TTL } from './cache';

// Use a more specific search approach for DexScreener
const DEX_SCREENER_SEARCH_URL = 'https://api.dexscreener.com/latest/dex/search';

class ApiService {
  private corsProxyIndex = 0;

  private getCorsProxy(): string {
    return CORS_PROXIES[this.corsProxyIndex];
  }

  private switchCorsProxy(): void {
    this.corsProxyIndex = (this.corsProxyIndex + 1) % CORS_PROXIES.length;
  }

  private async makeRequest(url: string): Promise<AxiosResponse<any>> {
    const maxRetries = CORS_PROXIES.length;
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const corsProxy = this.getCorsProxy();
        const proxiedUrl = corsProxy + encodeURIComponent(url);
        
        console.log(`Attempting API request with proxy ${i + 1}/${maxRetries}: ${corsProxy}`);
        
        const response = await axios.get(proxiedUrl, {
          timeout: 15000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        // Handle different CORS proxy response formats
        if (response.data && typeof response.data === 'object') {
          if (response.data.contents) {
            // allorigins.win format
            const parsedData = JSON.parse(response.data.contents);
            console.log('Parsed data from allorigins:', parsedData);
            return {
              ...response,
              data: parsedData
            };
          } else if (response.data.pairs || response.data.schemaVersion) {
            // Direct response from DexScreener
            console.log('Direct DexScreener response:', response.data);
            return response;
          }
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`CORS proxy ${i + 1} failed:`, error);
        this.switchCorsProxy();
        
        if (i === maxRetries - 1) {
          break;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Failed to fetch data after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  async searchPairsForBlockchain(blockchain: Blockchain, quoteSymbol: string): Promise<Coin[]> {
    // Skip single-letter searches that cause CORS errors
    if (quoteSymbol.length === 1 && /^[A-Z0-9]$/i.test(quoteSymbol)) {
      console.log(`⏩ Skipping single-letter search: ${quoteSymbol} (causes CORS issues)`);
      return [];
    }
    
    // Check cache first
    const cacheKey = cacheService.generateKey('dexscreener', blockchain, quoteSymbol);
    const cachedData = cacheService.get<Coin[]>(cacheKey);
    
    if (cachedData) {
      console.log(`💰 Cache hit for DexScreener search: ${blockchain}/${quoteSymbol} - SAVED API CALL!`);
      return cachedData;
    }
    
    try {
      // Search for pairs using the format "QuoteSymbol" to get pairs on specific blockchains
      const searchQuery = quoteSymbol;
      const searchUrl = `${DEX_SCREENER_SEARCH_URL}?q=${encodeURIComponent(searchQuery)}`;
      
      console.log(`🔍 DexScreener API call: ${searchQuery} on ${blockchain} - API COST INCURRED`);
      
      const response = await this.makeRequest(searchUrl);
      const data: DexScreenerResponse = response.data;
      
      if (!data || !data.pairs || !Array.isArray(data.pairs)) {
        console.log('No pairs found in response');
        // Cache empty results too (to avoid repeated failed calls)
        cacheService.set(cacheKey, [], CACHE_TTL.DEXSCREENER_SEARCH);
        return [];
      }

      const blockchainConfig = BLOCKCHAIN_CONFIGS[blockchain];
      
      // More lenient blockchain filtering - check multiple fields
      const filteredPairs = data.pairs.filter(pair => {
        const chainMatches = 
          pair.chainId === blockchainConfig.chainId || 
          pair.chainId === blockchainConfig.name ||
          pair.dexId?.toLowerCase().includes(blockchainConfig.name.toLowerCase()) ||
          pair.url?.toLowerCase().includes(blockchainConfig.name.toLowerCase());
        
        console.log(`Pair ${pair.baseToken?.symbol}/${pair.quoteToken?.symbol} - chainId: ${pair.chainId}, dexId: ${pair.dexId}, matches: ${chainMatches}`);
        
        return chainMatches;
      });

      console.log(`Found ${filteredPairs.length} pairs for ${blockchain} after filtering`);
      
      // Cache the result for 5 minutes
      cacheService.set(cacheKey, filteredPairs, CACHE_TTL.DEXSCREENER_SEARCH);
      console.log(`📦 Cached DexScreener search: ${blockchain}/${quoteSymbol} (5 min TTL)`);
      
      return filteredPairs;
    } catch (error) {
      console.error(`Error searching pairs for ${blockchain} with quote ${quoteSymbol}:`, error);
      // Cache empty result to avoid repeated failed calls
      cacheService.set(cacheKey, [], CACHE_TTL.DEXSCREENER_SEARCH);
      return []; // Return empty array instead of throwing to allow other searches to continue
    }
  }

  async getAllTokensForBlockchain(blockchain: Blockchain): Promise<Coin[]> {
    console.log(`⚡ Using fast comprehensive token discovery for ${blockchain}...`);
    
    try {
      // Import the fast API service
      const { fastApiService } = await import('./fast-api');
      
      // Use fast approach to get comprehensive token data
      const tokens = await fastApiService.getAllTokensForBlockchain(blockchain);
      
      console.log(`✅ Fast discovery returned ${tokens.length} tokens`);
      
      // Additional deduplication to fix duplicate issues
      const deduplicatedTokens = this.deduplicateTokens(tokens);
      console.log(`🔧 After deduplication: ${deduplicatedTokens.length} unique tokens`);
      
      return deduplicatedTokens;
      
    } catch (error) {
      console.error(`❌ Fast discovery failed:`, error);
      
      // Simple fallback
      console.log(`🔄 Using simple fallback...`);
      const fallbackTokens = await this.searchPairsForBlockchain(blockchain, 'USDC');
      return this.deduplicateTokens(fallbackTokens);
    }
  }

  // Improved deduplication method
  private deduplicateTokens(tokens: Coin[]): Coin[] {
    const seen = new Map<string, Coin>();
    
    tokens.forEach(token => {
      const contractAddress = token.baseToken?.address;
      if (contractAddress) {
        // Keep the token with the highest volume or liquidity
        const existing = seen.get(contractAddress);
        if (!existing) {
          seen.set(contractAddress, token);
        } else {
          const existingLiquidity = existing.liquidity?.usd || 0;
          const newLiquidity = token.liquidity?.usd || 0;
          const existingVolume = existing.volume?.h24 || 0;
          const newVolume = token.volume?.h24 || 0;
          
          // Keep the token with better data (higher liquidity or volume)
          if (newLiquidity > existingLiquidity || newVolume > existingVolume) {
            seen.set(contractAddress, token);
          }
        }
      }
    });
    
    const result = Array.from(seen.values());
    console.log(`🔧 Deduplication: ${tokens.length} -> ${result.length} tokens`);
    return result;
  }

  // Fetch recently updated token profiles - this is our main source of current tokens
  async fetchTokenProfiles(blockchain: Blockchain): Promise<Coin[]> {
    try {
      const url = 'https://api.dexscreener.com/token-profiles/latest/v1';
      console.log('📋 Fetching latest token profiles...');
      
      const response = await this.makeRequest(url);
      const profiles = response.data || [];
      
      // Filter by blockchain
      const blockchainConfig = BLOCKCHAIN_CONFIGS[blockchain];
      const filtered = profiles.filter((profile: any) => 
        profile.chainId === blockchainConfig.chainId || 
        profile.chainId === blockchain
      );
      
      console.log(`Found ${filtered.length} token profiles for ${blockchain}`);
      
      // For each profile, fetch the actual token data
      const tokenPromises = filtered.slice(0, 100).map((profile: any) => 
        this.searchByContractAddress(profile.tokenAddress)
      );
      
      const results = await Promise.allSettled(tokenPromises);
      const coins: Coin[] = [];
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          coins.push(...result.value);
        }
      });
      
      console.log(`📋 Fetched ${coins.length} tokens from profiles`);
      return coins;
    } catch (error) {
      console.error('❌ Error fetching token profiles:', error);
      return [];
    }
  }

  // Fetch boosted/trending tokens
  async fetchBoostedTokens(blockchain: Blockchain): Promise<Coin[]> {
    try {
      const url = 'https://api.dexscreener.com/token-boosts/top/v1';
      console.log('🚀 Fetching boosted tokens...');
      
      const response = await this.makeRequest(url);
      const boostedTokens = response.data || [];
      
      // Filter by blockchain
      const blockchainConfig = BLOCKCHAIN_CONFIGS[blockchain];
      const filtered = boostedTokens.filter((token: any) => 
        token.chainId === blockchainConfig.chainId || 
        token.chainId === blockchain
      );
      
      console.log(`Found ${filtered.length} boosted tokens for ${blockchain}`);
      
      // Fetch actual token data for each boosted token
      const tokenPromises = filtered.map((token: any) => 
        this.searchByContractAddress(token.tokenAddress)
      );
      
      const results = await Promise.allSettled(tokenPromises);
      const coins: Coin[] = [];
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          coins.push(...result.value);
        }
      });
      
      console.log(`🚀 Fetched ${coins.length} boosted tokens`);
      return coins;
    } catch (error) {
      console.error('❌ Error fetching boosted tokens:', error);
      return [];
    }
  }

  // Perform broad search as fallback - but much more targeted
  async performBroadSearch(blockchain: Blockchain): Promise<Coin[]> {
    console.log('🔍 Performing targeted broad search...');
    
    // Use only the most effective search terms that typically yield many results
    const broadSearchTerms = [
      'USDC', 'USDT', // These will give us most active pairs
      'SOL', 'ETH', 'BTC', // Major base currencies
      'AI', 'MEME', 'PEPE' // Popular categories
    ];
    
    const promises = broadSearchTerms.map(term => 
      this.searchPairsForBlockchain(blockchain, term)
    );
    
    const results = await Promise.allSettled(promises);
    const coins: Coin[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        coins.push(...result.value);
      }
    });
    
    console.log(`🔍 Broad search returned ${coins.length} additional tokens`);
    return coins;
  }

  // Add a method to test API connectivity
  async testApiConnection(): Promise<boolean> {
    try {
      const testUrl = `${DEX_SCREENER_SEARCH_URL}?q=SOL`;
      const response = await this.makeRequest(testUrl);
      console.log('API connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  // Method to search by contract address
  async searchByContractAddress(address: string): Promise<Coin[]> {
    try {
      const searchUrl = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
      console.log(`🔍 Searching for token by contract: ${address.slice(0, 8)}...`);
      
      const response = await this.makeRequest(searchUrl);
      const data: DexScreenerResponse = response.data;
      
      if (!data || !data.pairs || !Array.isArray(data.pairs)) {
        console.log('No pairs found for contract address');
        return [];
      }

      console.log(`Found ${data.pairs.length} pairs for contract ${address.slice(0, 8)}...`);
      return data.pairs;
    } catch (error) {
      console.error(`❌ Error searching contract ${address.slice(0, 8)}...:`, error);
      return [];
    }
  }

  // Fetch known high-volume contracts for the blockchain
  async fetchKnownContracts(blockchain: Blockchain): Promise<Coin[]> {
    const knownContracts: Record<Blockchain, string[]> = {
      solana: [
        'GUy9Tu8YtvvHoL3DcXLJxXvEN8PqEus6mWQUEchcbonk', // BOSS token
        '4mWTS6KztDEoMu2uqsnbgbeGRh6chjq7Fbpmbr1Ypump', // TOPLESS token
        // Add more as we discover popular tokens
      ],
      base: [],
      sui: [],
      tron: []
    };

    const contracts = knownContracts[blockchain] || [];
    if (contracts.length === 0) return [];

    console.log(`📋 Fetching ${contracts.length} known contracts for ${blockchain}...`);

    const promises = contracts.map(address => this.searchByContractAddress(address));
    const results = await Promise.allSettled(promises);
    
    const coins: Coin[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        coins.push(...result.value);
      }
    });

    console.log(`📋 Fetched ${coins.length} tokens from known contracts`);
    return coins;
  }
}

export const apiService = new ApiService();