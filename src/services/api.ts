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
    const blockchainConfig = BLOCKCHAIN_CONFIGS[blockchain];
    
    console.log(`Fetching all tokens for ${blockchain}...`);
    
    // Much more comprehensive search queries including specific meme coins
    const searchQueries = [
      // Native tokens
      blockchainConfig.name.toUpperCase(),
      blockchain.toUpperCase(),
      
      // Quote tokens for this blockchain
      ...blockchainConfig.quoteTokens,
      
      // Popular stablecoins and pairs
      'USDC', 'USDT', 'USD', 'BUSD',
      
      // Popular meme tokens and patterns
      'MEME', 'SHIB', 'DOGE', 'PEPE', 'FLOKI', 'BONK',
      'USELESS', 'USELESS COIN', // Adding specific search for useless coin
      'DICKBUTT', 'BUTT', 'DICK', // Adding more specific searches
      
      // Common trading pairs
      'BTC', 'ETH', 'BNB',
      
      // More meme coin patterns
      'BABY', 'SAFE', 'MOON', 'ELON', 'SHIBA', 'INU',
      'ROCKET', 'DIAMOND', 'APE', 'WOJAK', 'CHAD',
      'CATS', 'DOGS', 'FROG', 'BEAR', 'BULL',
      'TRUMP', 'BIDEN', 'PUTIN', 'XI', // Political memes
      'LAMBO', 'RICH', 'POOR', 'WAGMI', // Crypto culture
      'GM', 'GN', 'LFG', 'NGMI', // Crypto slang
      
      // Blockchain-specific popular tokens
      ...(blockchain === 'solana' ? ['WSOL', 'PYTH', 'JUP', 'WIF', 'POPCAT', 'MYRO', 'BOME', 'SMOL', 'PONKE'] : []),
      ...(blockchain === 'base' ? ['CBETH', 'AERO', 'BALD', 'TOSHI', 'DEGEN', 'BRETT'] : []),
      ...(blockchain === 'sui' ? ['CETUS', 'TURBOS', 'SUI', 'BUCK', 'BLUB'] : []),
      ...(blockchain === 'tron' ? ['JST', 'SUN', 'WIN', 'NFT', 'BTT'] : []),
      
      // Generic searches to catch more tokens
      'TOKEN', 'COIN', 'PUMP', 'MOON', 'FINANCE', 'PROTOCOL',
      'SWAP', 'DEX', 'DAO', 'DEFI', 'NFT',
      
      // Two-letter combinations to find more tokens
      'AA', 'AI', 'GO', 'UP', 'OK', 'NO', 'YES', 'LOL',
      
      // Popular token searches (removed single letters that cause CORS issues)
      'BTC', 'ETH', 'SOL',
      
      // Numbers and combinations (removed single digits)
      '420', '69', '100', '1000', '10000', '100X', '1000X'
    ];

    console.log(`Will search with ${searchQueries.length} different queries`);

    // Also search for specific known contract addresses
    const knownContracts: Record<Blockchain, string[]> = {
      solana: [
        'SBYS2yTH988WFCKUfDzXz26rtHmKBgMhxJ99Tjpbonk', // DICKBUTT
        // Add more known contracts here
      ],
      base: [],
      sui: [],
      tron: []
    };

    const promises = [
      ...searchQueries.map(query => this.searchPairsForBlockchain(blockchain, query)),
      ...knownContracts[blockchain].map(address => this.searchByContractAddress(address))
    ];

    try {
      const results = await Promise.allSettled(promises);
      const allCoins: Coin[] = [];
      const seenPairs = new Set<string>();

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`Search query ${index + 1}/${searchQueries.length} (${searchQueries[index]}) returned ${result.value.length} pairs`);
          result.value.forEach(coin => {
            // Use contract address for deduplication instead of pair address
            const contractAddress = coin.baseToken.address;
            const deduplicationKey = `${contractAddress}_${coin.chainId}`;
            
            if (!seenPairs.has(deduplicationKey)) {
              seenPairs.add(deduplicationKey);
              
              // Enhance coin data with additional fields
              const enhancedCoin = {
                ...coin,
                contractAddress: coin.baseToken.address, // Set primary contract address
                holderCount: undefined // Will be fetched from blockchain explorers in future
              };
              
              allCoins.push(enhancedCoin);
              
              // Log specific coins we're looking for
              const symbol = coin.baseToken.symbol?.toLowerCase() || '';
              if (symbol.includes('useless') || symbol.includes('unstable') || symbol.includes('catgif')) {
                console.log(`🎯 FOUND TARGET COIN: ${coin.baseToken.symbol} (${contractAddress.slice(0, 8)}...) - MC: ${coin.marketCap || coin.fdv || 'N/A'}, Age: ${coin.pairCreatedAt || 'N/A'}`);
              }
              
              console.log(`Added unique token: ${coin.baseToken.symbol} (${contractAddress.slice(0, 8)}...)`);
            } else {
              console.log(`Skipped duplicate token: ${coin.baseToken.symbol} (${contractAddress.slice(0, 8)}...)`);
            }
          });
        } else {
          console.error(`Search query ${index + 1}/${searchQueries.length} (${searchQueries[index]}) failed:`, result.reason);
        }
      });

      console.log(`Total unique pairs found for ${blockchain}: ${allCoins.length}`);
      
      // Log sample data for debugging and look for specific coins
      if (allCoins.length > 0) {
        console.log('Sample of found coins:');
        allCoins.slice(0, 10).forEach((coin, i) => {
          console.log(`${i + 1}. ${coin.baseToken?.symbol}/${coin.quoteToken?.symbol} - MC: ${coin.marketCap || coin.fdv || 'N/A'}, Age: ${coin.pairCreatedAt || 'N/A'}, Chain: ${coin.chainId}`);
        });
        
        // Search for specific coins mentioned by user
        const uselessCoins = allCoins.filter(coin => 
          coin.baseToken?.symbol?.toLowerCase().includes('useless') ||
          coin.baseToken?.name?.toLowerCase().includes('useless')
        );
        
        if (uselessCoins.length > 0) {
          console.log(`🎯 Found ${uselessCoins.length} "useless" coins:`, uselessCoins.map(c => ({
            symbol: c.baseToken.symbol,
            marketCap: c.marketCap || c.fdv,
            age: c.pairCreatedAt,
            contractAddress: c.baseToken.address
          })));
        } else {
          console.log('⚠️ No "useless" coins found in results');
          // Show available symbols to help debug
          const availableSymbols = allCoins.map(c => c.baseToken?.symbol).filter(Boolean).slice(0, 50);
          console.log('Available symbols (first 50):', availableSymbols);
        }
      }
      
      return allCoins;
    } catch (error) {
      console.error(`Error fetching all tokens for ${blockchain}:`, error);
      throw new Error(`Failed to fetch tokens for ${blockchain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      console.log(`Searching for token by contract address: ${address}`);
      
      const response = await this.makeRequest(searchUrl);
      const data: DexScreenerResponse = response.data;
      
      if (!data || !data.pairs || !Array.isArray(data.pairs)) {
        console.log('No pairs found for contract address');
        return [];
      }

      console.log(`Found ${data.pairs.length} pairs for contract ${address}`);
      return data.pairs;
    } catch (error) {
      console.error(`Error searching by contract address ${address}:`, error);
      return [];
    }
  }
}

export const apiService = new ApiService(); 