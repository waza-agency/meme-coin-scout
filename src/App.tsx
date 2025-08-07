import { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { Coin, FilterCriteria, Blockchain, ViewMode } from './types';
import { apiService } from './services/api';
import { filterCoins, sortCoinsByMarketCap } from './utils/filters';
import { SUPPORTED_BLOCKCHAINS, BLOCKCHAIN_CONFIGS } from './config/blockchains';
import BlockchainSelector from './components/BlockchainSelector';
import FilterControls from './components/FilterControls';
import CoinGrid from './components/CoinGrid';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import NoResults from './components/NoResults';
import ContractAnalyzer from './components/ContractAnalyzer';
import ViewSelector from './components/ViewSelector';
import DonationBanner from './components/DonationBanner';
import FilterStatus from './components/FilterStatus';
// Conditionally import debug utilities only in development
let runAllFilterTests: any = null;

if (import.meta.env.DEV) {
  // Dynamic imports for development-only utilities
  import('./utils/filter-test').then(module => {
    runAllFilterTests = module.runAllFilterTests;
  });
}

function App() {
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain>('solana');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [filters, setFilters] = useState<FilterCriteria>({
    minMarketCap: 1000,
    maxMarketCap: 10000000,
    minAge: 0,
    maxAge: 30,
    minLiquidity: 1000,
    maxLiquidity: 5000000
  });
  
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [resultLimit, setResultLimit] = useState<number>(30);
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await apiService.testApiConnection();
        if (connected) {
          console.log('✅ API connection test successful');
        } else {
          console.log('❌ API connection test failed');
        }
      } catch (error) {
        console.error('API connection test error:', error);
      }
    };
    
    testConnection();
    
    // Run filter tests in development mode with cleanup
    let filterTestTimeout: NodeJS.Timeout | null = null;
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🧪 Running filter tests...');
      filterTestTimeout = setTimeout(() => {
        if (runAllFilterTests && import.meta.env.DEV) {
          runAllFilterTests();
        }
      }, 1000);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (filterTestTimeout) {
        clearTimeout(filterTestTimeout);
        console.log('🧹 Cleared filter test timeout');
      }
    };
  }, []);

  // Helper function to apply filtering, sorting, and limiting
  const applyFiltersAndLimit = (
    coins: Coin[], 
    filterCriteria: FilterCriteria, 
    limit: number
  ): Coin[] => {
    console.log(`🔄 Applying filters and limit to ${coins.length} coins`);
    const filtered = filterCoins(coins, filterCriteria);
    console.log(`📊 Filtered to ${filtered.length} coins`);
    
    const sorted = sortCoinsByMarketCap(filtered);
    console.log(`📊 Sorted ${sorted.length} coins by market cap`);
    
    const limited = sorted.slice(0, limit);
    console.log(`📊 Showing ${limited.length} results (limit: ${limit})`);
    
    return limited;
  };

  // Helper function to compare coin arrays
  const areCoinsEqual = (coins1: Coin[], coins2: Coin[]) => {
    if (coins1.length !== coins2.length) return false;
    
    const coinMap = new Map(coins2.map(c => [c.pairAddress, c]));
    
    return coins1.every(coin1 => {
      const coin2 = coinMap.get(coin1.pairAddress);
      if (!coin2) return false;
      
      // Compare relevant fields that might change
      return (
        coin1.marketCap === coin2.marketCap &&
        coin1.liquidity?.usd === coin2.liquidity?.usd &&
        coin1.pairCreatedAt === coin2.pairCreatedAt &&
        coin1.priceUsd === coin2.priceUsd &&
        coin1.volume?.h24 === coin2.volume?.h24
      );
    });
  };

  const handleSearch = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    console.log(`${isAutoRefresh ? '🔄 Auto-refreshing' : '🔍 Starting search'} for ${selectedBlockchain}...`);
    console.log('Filters:', filters);
    
    try {
      const coins = await apiService.getAllTokensForBlockchain(selectedBlockchain);
      console.log(`📦 Retrieved ${coins.length} raw coins from API`);
      
      // Log sample of raw data for debugging
      if (coins.length > 0) {
        console.log('Sample coin data:', coins[0]);
      }
      
      // Apply filtering, sorting, and limiting using reusable function
      const limited = applyFiltersAndLimit(coins, filters, resultLimit);
      console.log(`✅ Processed ${coins.length} coins -> ${limited.length} final results`)
      
      // Only update state if data has changed
      if (!isAutoRefresh || !areCoinsEqual(limited, filteredCoins)) {
        setAllCoins(coins);
        setFilteredCoins(limited);
        
        if (isAutoRefresh && filteredCoins.length > 0) {
          console.log('🔄 Data has changed, updating display');
        }
      } else if (isAutoRefresh) {
        console.log('✅ No changes detected, keeping current display');
      }
      
      setLastRefresh(new Date());
      
      if (coins.length === 0) {
        console.log('⚠️ No coins found from API');
      } else if (limited.length === 0) {
        console.log('⚠️ No coins matched filter criteria');
      } else {
        console.log('✅ Search completed successfully');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error(`❌ ${isAutoRefresh ? 'Auto-refresh' : 'Search'} failed:`, errorMessage);
      if (!isAutoRefresh) {
        setError(errorMessage);
        setAllCoins([]);
        setFilteredCoins([]);
      }
    } finally {
      if (isAutoRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [selectedBlockchain, filters, filteredCoins, resultLimit]);

  const handleFilterChange = useCallback((newFilters: FilterCriteria) => {
    console.log('🔧 Filter changed:', newFilters);
    setFilters(newFilters);
    
    // Automatically re-filter existing data when filters change
    if (allCoins.length > 0) {
      console.log('🔄 Auto-filtering existing data with new criteria');
      const limited = applyFiltersAndLimit(allCoins, newFilters, resultLimit);
      setFilteredCoins(limited);
      console.log(`✅ Re-filtered to ${limited.length} coins`);
    }
  }, [allCoins, resultLimit]);

  const handleBlockchainChange = useCallback((blockchain: Blockchain) => {
    console.log(`🔗 Blockchain changed to: ${blockchain}`);
    setSelectedBlockchain(blockchain);
    setAllCoins([]);
    setFilteredCoins([]);
    setError(null);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && filteredCoins.length > 0) {
      console.log('⏰ Setting up auto-refresh interval (60 seconds)');
      
      intervalRef.current = setInterval(() => {
        handleSearch(true);
      }, 60000); // 60 seconds
      
      return () => {
        if (intervalRef.current) {
          console.log('⏹️ Clearing auto-refresh interval');
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        console.log('⏹️ Clearing auto-refresh interval');
        clearInterval(intervalRef.current);
      }
    }
  }, [autoRefresh, filteredCoins.length, handleSearch]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
    console.log(`🔄 Auto-refresh ${!autoRefresh ? 'enabled' : 'disabled'}`);
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-crypto-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-crypto-accent">Meme</span> Coin Screener
          </h1>
          <p className="text-gray-400 text-lg">
            Analyze any token or discover early-stage meme coin opportunities before they moon
          </p>
        </header>

        {/* Donation Banner */}
        <div className="max-w-6xl mx-auto mb-8">
          <DonationBanner />
        </div>

        {/* Contract Analyzer */}
        <div className="max-w-6xl mx-auto mb-8">
          <ContractAnalyzer />
        </div>

        {/* Divider */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-400 text-sm font-medium">OR DISCOVER NEW TOKENS</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Blockchain Selection */}
            <div className="lg:col-span-1">
              <BlockchainSelector
                selectedBlockchain={selectedBlockchain}
                onBlockchainChange={handleBlockchainChange}
                blockchains={SUPPORTED_BLOCKCHAINS}
                configs={BLOCKCHAIN_CONFIGS}
              />
            </div>

            {/* Filter Controls */}
            <div className="lg:col-span-2">
              <FilterControls
                filters={filters}
                onFilterChange={handleFilterChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Controls Row */}
          <div className="mt-4 flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Result Limit Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Show top:</span>
              <div className="flex gap-2">
                {[15, 30, 50, 100].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => {
                      console.log(`📊 Changing result limit to ${limit}`);
                      setResultLimit(limit);
                      
                      // Re-apply limit to existing filtered results
                      if (allCoins.length > 0) {
                        const limited = applyFiltersAndLimit(allCoins, filters, limit);
                        setFilteredCoins(limited);
                        console.log(`✅ Updated display to show ${limited.length} results`);
                      }
                    }}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      resultLimit === limit
                        ? 'bg-crypto-accent text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {limit}
                  </button>
                ))}
              </div>
              <span className="text-gray-400 text-sm ml-2">results</span>
            </div>

            {/* View Selector */}
            <ViewSelector
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Search Button and Auto-Refresh Controls */}
          <div className="text-center mt-6 space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleSearch(false)}
                disabled={isLoading || isRefreshing}
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Apply & Reload
                  </>
                )}
              </button>
              
              {filteredCoins.length > 0 && (
                <button
                  onClick={toggleAutoRefresh}
                  className={`btn-secondary inline-flex items-center gap-2 px-6 py-4 ${
                    autoRefresh ? 'bg-crypto-accent bg-opacity-20 border-crypto-accent' : ''
                  }`}
                  title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh every minute'}
                >
                  <RefreshCw className={`w-5 h-5 ${autoRefresh && isRefreshing ? 'animate-spin' : ''}`} />
                  {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
                </button>
              )}
              
              {/* Test Filters Button - Development Only */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    console.log('🧪 Running manual filter tests...');
                    if (runAllFilterTests && import.meta.env.DEV) {
          runAllFilterTests();
        }
                  }}
                  className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                  title="Run filter logic tests"
                >
                  🧪 Test Filters
                </button>
              )}
            </div>
            
            {/* Refresh Status */}
            {autoRefresh && lastRefresh && (
              <div className="text-sm text-gray-400">
                <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
                {isRefreshing && <span className="ml-2">(Refreshing...)</span>}
              </div>
            )}
          </div>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
              <p><strong>Debug Info:</strong></p>
              <p>Selected: {selectedBlockchain} | All Coins: {allCoins.length} | Filtered: {filteredCoins.length} | Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}</p>
              <p>Filters: MC ${filters.minMarketCap.toLocaleString()}-${filters.maxMarketCap.toLocaleString()}, Age {filters.minAge}-{filters.maxAge} days, Liquidity ${filters.minLiquidity.toLocaleString()}-${filters.maxLiquidity.toLocaleString()}</p>
              {lastRefresh && <p>Last Refresh: {lastRefresh.toLocaleTimeString()}</p>}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          {isLoading && <LoadingSpinner />}
          
          {error && (
            <ErrorMessage 
              message={error}
              onRetry={() => handleSearch(false)}
            />
          )}

          {/* Filter Status - show when we have data */}
          {!isLoading && !error && allCoins.length > 0 && (
            <FilterStatus
              totalCoins={allCoins.length}
              filteredCoins={filteredCoins.length}
              filters={filters}
            />
          )}

          {!isLoading && !error && filteredCoins.length === 0 && allCoins.length > 0 && (
            <NoResults 
              filters={filters}
              blockchain={BLOCKCHAIN_CONFIGS[selectedBlockchain].displayName}
            />
          )}

          {!isLoading && !error && filteredCoins.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Showing {filteredCoins.length} coins matching your criteria
                </h2>
                <p className="text-gray-400">
                  on {BLOCKCHAIN_CONFIGS[selectedBlockchain].displayName}
                  {resultLimit < filteredCoins.length && ` (limited to top ${resultLimit})`}
                </p>
              </div>
              <CoinGrid coins={filteredCoins} viewMode={viewMode} />
            </div>
          )}

          {!isLoading && !error && allCoins.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No data found</h3>
              <p className="text-gray-400 mb-4">
                Try clicking "Apply & Reload" to search for coins on {BLOCKCHAIN_CONFIGS[selectedBlockchain].displayName}
              </p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default App; 