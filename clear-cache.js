// Clear social mentions cache
console.log('🧹 Clearing social mentions cache...');

if (typeof window !== 'undefined' && window.localStorage) {
  // Find and remove all cache entries
  const keys = Object.keys(localStorage);
  let cleared = 0;
  
  keys.forEach(key => {
    if (key.startsWith('cache_social:')) {
      localStorage.removeItem(key);
      cleared++;
      console.log(`Removed: ${key}`);
    }
  });
  
  console.log(`✅ Cleared ${cleared} cached social mentions entries`);
  console.log('🔄 Refresh the page to get fresh data');
} else {
  console.log('❌ localStorage not available');
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.clearSocialCache = () => {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith('cache_social:')) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    
    console.log(`✅ Cleared ${cleared} social cache entries`);
    location.reload(); // Auto refresh
  };
}