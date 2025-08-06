import { Coin, FilterCriteria } from '../types';

export const calculateAge = (pairCreatedAt: number): number => {
  try {
    if (!pairCreatedAt || isNaN(pairCreatedAt)) {
      console.warn('Invalid timestamp provided:', pairCreatedAt);
      return 0;
    }
    
    // Handle different timestamp formats
    let createdDate: Date;
    
    if (pairCreatedAt > 1000000000000) {
      // Timestamp is in milliseconds
      createdDate = new Date(pairCreatedAt);
    } else if (pairCreatedAt > 1000000000) {
      // Timestamp is in seconds
      createdDate = new Date(pairCreatedAt * 1000);
    } else {
      // Invalid timestamp
      console.warn('Timestamp appears to be invalid:', pairCreatedAt);
      return 0;
    }
    
    // Check if the date is valid
    if (isNaN(createdDate.getTime())) {
      console.warn('Could not create valid date from timestamp:', pairCreatedAt);
      return 0;
    }
    
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    
    // If the date is in the future, something is wrong
    if (diffTime < 0) {
      console.warn('Pair created date is in the future:', createdDate.toISOString());
      return 0;
    }
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Ensure we don't return unrealistic ages
    return Math.max(0, Math.min(diffDays, 3650)); // Cap at 10 years
  } catch (error) {
    console.warn('Error calculating age for timestamp:', pairCreatedAt, error);
    return 0; // Return 0 if we can't calculate age
  }
};

export const formatMarketCap = (marketCap: number): string => {
  // Format with commas and dollar sign
  return `$${marketCap.toLocaleString()}`;
};

export const formatAge = (days: number): string => {
  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return '1 day';
  } else {
    return `${days} days`;
  }
};

export const filterCoins = (coins: Coin[], criteria: FilterCriteria): Coin[] => {
  console.log(`🔍 Starting filtering of ${coins.length} coins with criteria:`, criteria);
  
  if (!coins || coins.length === 0) {
    console.log('⚠️ No coins to filter');
    return [];
  }

  let filteredCount = 0;
  let mcFilteredOut = 0;
  let ageFilteredOut = 0;
  let liquidityFilteredOut = 0;
  let noDataFiltered = 0;
  
  const filtered = coins.filter(coin => {
    const symbol = coin.baseToken?.symbol || 'Unknown';
    
    // Get market cap value - prioritize marketCap over fdv
    const marketCap = coin.marketCap || coin.fdv || 0;
    
    // Calculate age more reliably
    let age = 0;
    if (coin.pairCreatedAt) {
      age = calculateAge(coin.pairCreatedAt);
    } else {
      // If no creation date, filter out the coin as we can't determine age
      console.log(`❌ ${symbol} - No creation date, filtering out`);
      noDataFiltered++;
      return false;
    }

    // Get liquidity value
    const liquidity = coin.liquidity?.usd || 0;
    
    // Apply strict filtering - all criteria must be met
    const passesMarketCap = marketCap > 0 && marketCap >= criteria.minMarketCap && marketCap <= criteria.maxMarketCap;
    const passesAge = age >= criteria.minAge && age <= criteria.maxAge;
    const passesLiquidity = liquidity >= criteria.minLiquidity && liquidity <= criteria.maxLiquidity;

    // Count filter failures for reporting
    const failedFilters = [];
    if (!passesMarketCap) {
      failedFilters.push('Market Cap');
      mcFilteredOut++;
    }
    if (!passesAge) {
      failedFilters.push('Age');
      ageFilteredOut++;
    }
    if (!passesLiquidity) {
      failedFilters.push('Liquidity');
      liquidityFilteredOut++;
    }

    const passes = passesMarketCap && passesAge && passesLiquidity;
    
    if (passes) {
      filteredCount++;
      console.log(`✅ ${symbol} - PASSED: MC: ${formatMarketCap(marketCap)}, Age: ${age}d, Liquidity: ${formatMarketCap(liquidity)}`);
    } else {
      console.log(`❌ ${symbol} - FAILED: ${failedFilters.join(', ')} | MC: ${marketCap ? formatMarketCap(marketCap) : 'N/A'}, Age: ${age}d, Liquidity: ${liquidity ? formatMarketCap(liquidity) : 'N/A'}`);
    }

    return passes;
  });

  console.log(`📈 Filtering Results:
    - Input coins: ${coins.length}
    - Passed all filters: ${filteredCount}
    - Filtered out by Market Cap: ${mcFilteredOut}
    - Filtered out by Age: ${ageFilteredOut}
    - Filtered out by Liquidity: ${liquidityFilteredOut}
    - No creation date: ${noDataFiltered}
    - Final results: ${filtered.length}
  `);

  return filtered;
};

export const sortCoinsByMarketCap = (coins: Coin[]): Coin[] => {
  return [...coins].sort((a, b) => {
    const marketCapA = a.marketCap || a.fdv || 0;
    const marketCapB = b.marketCap || b.fdv || 0;
    return marketCapB - marketCapA;
  });
};

export const getTokenImageUrl = (coin: Coin): string => {
  // Try to get image from info object
  if (coin.info?.imageUrl) {
    return coin.info.imageUrl;
  }

  // Fallback to a default token image or generate one based on symbol
  const symbol = coin.baseToken?.symbol || 'T';
  return `https://via.placeholder.com/40/00d4aa/ffffff?text=${symbol.charAt(0)}`;
};

export const getBubblemapsUrl = (coin: Coin): string => {
  const contractAddress = coin.baseToken?.address;
  const chainId = coin.chainId;
  
  if (!contractAddress) return '';
  
  // Map chainId to Bubblemaps chain identifier
  const chainMap: Record<string, string> = {
    'solana': 'sol',
    'ethereum': 'eth',
    'bsc': 'bsc',
    'base': 'base',
    'polygon': 'poly',
    'arbitrum': 'arbi',
    'avalanche': 'avax',
    'fantom': 'ftm',
    'cronos': 'cro'
  };
  
  const bubbleChain = chainMap[chainId || ''] || 'sol'; // Default to Solana
  
  return `https://app.bubblemaps.io/${bubbleChain}/token/${contractAddress}`;
}; 