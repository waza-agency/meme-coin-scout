import { Coin, FilterCriteria } from '../types';
import { filterCoins, calculateAge } from './filters';

// Test function to validate filter logic
export const testFilterLogic = () => {
  console.log('🧪 Starting Filter Logic Tests');

  // Create mock coins with various properties
  const mockCoins: Coin[] = [
    {
      pairAddress: '1',
      baseToken: { name: 'Test Coin 1', symbol: 'TEST1', address: '0x1' },
      quoteToken: { name: 'USDT', symbol: 'USDT', address: '0x2' },
      dexId: 'uniswap',
      url: 'https://test.com',
      pairCreatedAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
      marketCap: 50000, // Should pass market cap filter
      liquidity: { usd: 10000 }, // Should pass liquidity filter
      priceNative: '0.001',
      txns: {
        m5: { buys: 5, sells: 3 },
        h1: { buys: 15, sells: 10 },
        h6: { buys: 50, sells: 30 },
        h24: { buys: 200, sells: 150 }
      }
    },
    {
      pairAddress: '2',
      baseToken: { name: 'Test Coin 2', symbol: 'TEST2', address: '0x3' },
      quoteToken: { name: 'USDT', symbol: 'USDT', address: '0x2' },
      dexId: 'uniswap',
      url: 'https://test.com',
      pairCreatedAt: Date.now() - (100 * 24 * 60 * 60 * 1000), // 100 days ago
      marketCap: 500000, // Should fail age filter (>30 days)
      liquidity: { usd: 50000 },
      priceNative: '0.01',
      txns: {
        m5: { buys: 2, sells: 1 },
        h1: { buys: 10, sells: 5 },
        h6: { buys: 30, sells: 20 },
        h24: { buys: 100, sells: 80 }
      }
    },
    {
      pairAddress: '3',
      baseToken: { name: 'Test Coin 3', symbol: 'TEST3', address: '0x4' },
      quoteToken: { name: 'USDT', symbol: 'USDT', address: '0x2' },
      dexId: 'uniswap',
      url: 'https://test.com',
      pairCreatedAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
      marketCap: 20000000, // Should fail market cap filter (>10M)
      liquidity: { usd: 100000 },
      priceNative: '0.1',
      txns: {
        m5: { buys: 10, sells: 8 },
        h1: { buys: 25, sells: 20 },
        h6: { buys: 80, sells: 60 },
        h24: { buys: 300, sells: 250 }
      }
    },
    {
      pairAddress: '4',
      baseToken: { name: 'Test Coin 4', symbol: 'TEST4', address: '0x5' },
      quoteToken: { name: 'USDT', symbol: 'USDT', address: '0x2' },
      dexId: 'uniswap',
      url: 'https://test.com',
      pairCreatedAt: Date.now() - (15 * 24 * 60 * 60 * 1000), // 15 days ago
      marketCap: 2000000, // Should pass all filters
      liquidity: { usd: 200000 },
      priceNative: '0.05',
      txns: {
        m5: { buys: 8, sells: 5 },
        h1: { buys: 20, sells: 15 },
        h6: { buys: 60, sells: 45 },
        h24: { buys: 250, sells: 200 }
      }
    },
    {
      pairAddress: '5',
      baseToken: { name: 'Test Coin 5', symbol: 'TEST5', address: '0x6' },
      quoteToken: { name: 'USDT', symbol: 'USDT', address: '0x2' },
      dexId: 'uniswap',
      url: 'https://test.com',
      pairCreatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
      marketCap: 5000, // Should pass market cap
      liquidity: { usd: 500 }, // Should fail liquidity filter (<1000)
      priceNative: '0.0001',
      txns: {
        m5: { buys: 1, sells: 0 },
        h1: { buys: 3, sells: 2 },
        h6: { buys: 10, sells: 8 },
        h24: { buys: 40, sells: 35 }
      }
    }
  ];

  // Test filter criteria
  const testFilters: FilterCriteria = {
    minMarketCap: 1000,
    maxMarketCap: 10000000,
    minAge: 0,
    maxAge: 30,
    minLiquidity: 1000,
    maxLiquidity: 5000000
  };

  console.log('📊 Test Data:');
  mockCoins.forEach((coin, i) => {
    const age = calculateAge(coin.pairCreatedAt);
    console.log(`  ${i + 1}. ${coin.baseToken.symbol}: MC: $${coin.marketCap?.toLocaleString()}, Age: ${age}d, Liquidity: $${coin.liquidity?.usd?.toLocaleString()}`);
  });

  console.log('\n🔍 Applying filters:');
  console.log('  Market Cap: $1,000 - $10,000,000');
  console.log('  Age: 0 - 30 days');
  console.log('  Liquidity: $1,000 - $5,000,000');

  const filteredResults = filterCoins(mockCoins, testFilters);

  console.log(`\n✅ Results: ${filteredResults.length}/${mockCoins.length} coins passed filters`);
  
  const expectedResults = [
    'TEST1', // Should pass: MC 50k, Age 1d, Liq 10k
    'TEST4'  // Should pass: MC 2M, Age 15d, Liq 200k
  ];

  const actualResults = filteredResults.map(c => c.baseToken.symbol);
  
  console.log('Expected:', expectedResults);
  console.log('Actual:', actualResults);

  const testPassed = expectedResults.length === actualResults.length && 
                     expectedResults.every(symbol => actualResults.includes(symbol));

  if (testPassed) {
    console.log('🎉 Filter test PASSED!');
  } else {
    console.log('❌ Filter test FAILED!');
    console.log('Missing:', expectedResults.filter(s => !actualResults.includes(s)));
    console.log('Unexpected:', actualResults.filter(s => !expectedResults.includes(s)));
  }

  return {
    passed: testPassed,
    expected: expectedResults.length,
    actual: actualResults.length,
    mockCoins: mockCoins.length,
    filteredResults
  };
};

// Test age calculation with various timestamp formats
export const testAgeCalculation = () => {
  console.log('\n🧪 Testing Age Calculation');

  const now = Date.now();
  const testCases = [
    { timestamp: now - (24 * 60 * 60 * 1000), expected: 1, description: '1 day ago (ms)' },
    { timestamp: (now - (24 * 60 * 60 * 1000)) / 1000, expected: 1, description: '1 day ago (seconds)' },
    { timestamp: now - (7 * 24 * 60 * 60 * 1000), expected: 7, description: '7 days ago (ms)' },
    { timestamp: 0, expected: 0, description: 'Invalid timestamp (0)' },
    { timestamp: -1, expected: 0, description: 'Invalid timestamp (-1)' },
    { timestamp: now + (24 * 60 * 60 * 1000), expected: 0, description: 'Future timestamp' },
  ];

  let passed = 0;
  testCases.forEach((test, i) => {
    const result = calculateAge(test.timestamp);
    const success = Math.abs(result - test.expected) <= 1; // Allow 1 day tolerance
    console.log(`  ${i + 1}. ${test.description}: Expected ~${test.expected}, Got ${result} ${success ? '✅' : '❌'}`);
    if (success) passed++;
  });

  console.log(`\n📊 Age calculation tests: ${passed}/${testCases.length} passed`);
  return passed === testCases.length;
};

// Export test runner
export const runAllFilterTests = () => {
  console.log('🚀 Running All Filter Tests');
  console.log('================================');
  
  const filterTest = testFilterLogic();
  const ageTest = testAgeCalculation();
  
  console.log('\n📈 Final Results:');
  console.log(`  Filter Logic: ${filterTest.passed ? 'PASS' : 'FAIL'}`);
  console.log(`  Age Calculation: ${ageTest ? 'PASS' : 'FAIL'}`);
  console.log('================================');
  
  return filterTest.passed && ageTest;
};