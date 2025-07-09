import { Coin, FilterCriteria } from '../types';

export const calculateAge = (pairCreatedAt: number): number => {
  try {
    // Handle different timestamp formats
    let createdDate: Date;
    
    if (pairCreatedAt > 1000000000000) {
      // Timestamp is in milliseconds
      createdDate = new Date(pairCreatedAt);
    } else {
      // Timestamp is in seconds
      createdDate = new Date(pairCreatedAt * 1000);
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Ensure we don't return negative or unrealistic ages
    return Math.max(0, Math.min(diffDays, 10000)); // Cap at 10,000 days
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
  
  // First, let's analyze what we have
  const coinsWithMarketCap = coins.filter(coin => coin.marketCap || coin.fdv);
  const coinsWithAge = coins.filter(coin => coin.pairCreatedAt);
  
  console.log(`📊 Analysis:
    - Total coins: ${coins.length}
    - With market cap: ${coinsWithMarketCap.length}
    - With age data: ${coinsWithAge.length}
  `);
  
  // Sample a few coins to see their data
  console.log('📝 Sample coin data:');
  coins.slice(0, 10).forEach((coin, i) => {
    const marketCap = coin.marketCap || coin.fdv;
    const age = coin.pairCreatedAt ? calculateAge(coin.pairCreatedAt) : 'No date';
    console.log(`  ${i + 1}. ${coin.baseToken?.symbol}/${coin.quoteToken?.symbol} - MC: ${marketCap || 'N/A'}, Age: ${age}, Chain: ${coin.chainId}, PairCreated: ${coin.pairCreatedAt}`);
  });
  
  let filteredCount = 0;
  let mcFilteredOut = 0;
  let ageFilteredOut = 0;
  let bothFilteredOut = 0;
  let noDataFiltered = 0;
  
  // Let's also look for specific coins mentioned by user
  const uselessCoin = coins.find(coin => 
    coin.baseToken?.symbol?.toLowerCase().includes('useless') ||
    coin.baseToken?.name?.toLowerCase().includes('useless')
  );
  
  if (uselessCoin) {
    const marketCap = uselessCoin.marketCap || uselessCoin.fdv;
    const age = uselessCoin.pairCreatedAt ? calculateAge(uselessCoin.pairCreatedAt) : 'No date';
    console.log(`🔍 FOUND USELESS COIN: ${uselessCoin.baseToken?.symbol} - MC: ${marketCap || 'N/A'}, Age: ${age}, PairCreated: ${uselessCoin.pairCreatedAt}`);
  } else {
    console.log(`❌ Could not find "useless" coin in ${coins.length} total coins`);
    // Let's see what coins we do have
    console.log('Available coin symbols:', coins.map(c => c.baseToken?.symbol).filter(Boolean).slice(0, 20));
  }
  
  const filtered = coins.filter(coin => {
    const marketCap = coin.marketCap || coin.fdv;
    const symbol = coin.baseToken?.symbol || 'Unknown';
    
    // More lenient market cap handling - allow coins without market cap data to pass through
    // for manual review, but log them
    if (!marketCap) {
      noDataFiltered++;
      console.log(`⚠️ ${symbol} - No market cap data, allowing through for manual review`);
      // Allow coins without market cap to pass through, user can decide
      // return false; // <-- Commenting this out to be less restrictive
    }
    
    let age = 0;
    if (coin.pairCreatedAt) {
      age = calculateAge(coin.pairCreatedAt);
    } else {
      age = 1; // Assume recent if no creation date
      console.log(`⚠️ ${symbol} - No creation date, assuming age = 1 day`);
    }

    // Get liquidity value (could be from various sources)
    const liquidity = coin.liquidity?.usd || 0;
    
    // Apply filters - but only if we have market cap data
    const passesMarketCap = !marketCap || (marketCap >= criteria.minMarketCap && marketCap <= criteria.maxMarketCap);
    const passesAge = age >= criteria.minAge && age <= criteria.maxAge;
    const passesLiquidity = liquidity >= criteria.minLiquidity && liquidity <= criteria.maxLiquidity;

    // Detailed debug logging for specific cases
    const isUselessCoin = symbol.toLowerCase().includes('useless');
    if (isUselessCoin || !passesMarketCap || !passesAge || !passesLiquidity) {
      console.log(`🔍 DETAILED CHECK for ${symbol}:
        - Market Cap: ${marketCap ? formatMarketCap(marketCap) : 'N/A'}
        - Required MC Range: ${formatMarketCap(criteria.minMarketCap)} - ${formatMarketCap(criteria.maxMarketCap)}
        - Passes MC Filter: ${passesMarketCap}
        - Age: ${age} days
        - Required Age Range: ${criteria.minAge} - ${criteria.maxAge} days  
        - Passes Age Filter: ${passesAge}
        - Liquidity: ${liquidity ? formatMarketCap(liquidity) : 'N/A'}
        - Required Liquidity Range: ${formatMarketCap(criteria.minLiquidity)} - ${formatMarketCap(criteria.maxLiquidity)}
        - Passes Liquidity Filter: ${passesLiquidity}
        - Pair Created At: ${coin.pairCreatedAt}
        - Overall Passes: ${passesMarketCap && passesAge && passesLiquidity}
      `);
    }

    // Count filter reasons
    const failedFilters = [];
    if (!passesMarketCap) failedFilters.push('Market Cap');
    if (!passesAge) failedFilters.push('Age');
    if (!passesLiquidity) failedFilters.push('Liquidity');

    if (failedFilters.length > 0) {
      console.log(`❌ ${symbol} - Failed ${failedFilters.join(', ')} filter(s)`);
      if (failedFilters.includes('Market Cap')) mcFilteredOut++;
      if (failedFilters.includes('Age')) ageFilteredOut++;
      if (failedFilters.length > 1) bothFilteredOut++;
    }

    const passes = passesMarketCap && passesAge && passesLiquidity;
    if (passes) {
      filteredCount++;
      console.log(`✅ ${symbol} - PASSED: MC: ${marketCap ? formatMarketCap(marketCap) : 'No data'}, Age: ${age} days, Liquidity: ${liquidity ? formatMarketCap(liquidity) : 'No data'}`);
    }

    return passes;
  });

  console.log(`📈 Filtering Results:
    - Passed all filters: ${filteredCount}
    - No market cap data (allowed through): ${noDataFiltered}
    - Filtered out by market cap only: ${mcFilteredOut}
    - Filtered out by age only: ${ageFilteredOut}
    - Filtered out by both: ${bothFilteredOut}
    - Total in final results: ${filtered.length}
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