import { useState, useCallback, useEffect } from 'react';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import { Coin, FilterCriteria, Blockchain } from './types';
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
  }, []);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    console.log(`🔍 Starting search for ${selectedBlockchain}...`);
    console.log('Filters:', filters);
    
    try {
      const coins = await apiService.getAllTokensForBlockchain(selectedBlockchain);
      console.log(`📦 Retrieved ${coins.length} raw coins from API`);
      
      // Log sample of raw data for debugging
      if (coins.length > 0) {
        console.log('Sample coin data:', coins[0]);
      }
      
      const filtered = filterCoins(coins, filters);
      console.log(`✅ Filtered to ${filtered.length} coins matching criteria`);
      
      const sorted = sortCoinsByMarketCap(filtered);
      console.log(`📊 Sorted ${sorted.length} coins by market cap`);
      
      setAllCoins(coins);
      setFilteredCoins(sorted);
      
      if (coins.length === 0) {
        console.log('⚠️ No coins found from API');
      } else if (filtered.length === 0) {
        console.log('⚠️ No coins matched filter criteria');
      } else {
        console.log('✅ Search completed successfully');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('❌ Search failed:', errorMessage);
      setError(errorMessage);
      setAllCoins([]);
      setFilteredCoins([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBlockchain, filters]);

  const handleFilterChange = useCallback((newFilters: FilterCriteria) => {
    console.log('🔧 Filter changed:', newFilters);
    setFilters(newFilters);
  }, []);

  const handleBlockchainChange = useCallback((blockchain: Blockchain) => {
    console.log(`🔗 Blockchain changed to: ${blockchain}`);
    setSelectedBlockchain(blockchain);
    setAllCoins([]);
    setFilteredCoins([]);
    setError(null);
  }, []);

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

          {/* Search Button */}
          <div className="text-center mt-6">
            <button
              onClick={handleSearch}
              disabled={isLoading}
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
          </div>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
              <p><strong>Debug Info:</strong></p>
              <p>Selected: {selectedBlockchain} | All Coins: {allCoins.length} | Filtered: {filteredCoins.length}</p>
              <p>Filters: MC ${filters.minMarketCap.toLocaleString()}-${filters.maxMarketCap.toLocaleString()}, Age {filters.minAge}-{filters.maxAge} days, Liquidity ${filters.minLiquidity.toLocaleString()}-${filters.maxLiquidity.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          {isLoading && <LoadingSpinner />}
          
          {error && (
            <ErrorMessage 
              message={error}
              onRetry={handleSearch}
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
                  Found {filteredCoins.length} coins matching your criteria
                </h2>
                <p className="text-gray-400">
                  on {BLOCKCHAIN_CONFIGS[selectedBlockchain].displayName}
                </p>
              </div>
              <CoinGrid coins={filteredCoins} />
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