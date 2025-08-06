// Simple debug script to check environment variables
console.log('🔍 Environment Variables Debug:');
console.log('- VITE_XAI_API_KEY exists:', !!(import.meta.env?.VITE_XAI_API_KEY));
console.log('- VITE_XAI_API_KEY length:', (import.meta.env?.VITE_XAI_API_KEY || '').length);
console.log('- VITE_TWITTER_BEARER_TOKEN exists:', !!(import.meta.env?.VITE_TWITTER_BEARER_TOKEN));
console.log('- VITE_TWITTER_BEARER_TOKEN length:', (import.meta.env?.VITE_TWITTER_BEARER_TOKEN || '').length);

if (import.meta.env?.VITE_XAI_API_KEY) {
  console.log('- XAI Key starts with:', import.meta.env.VITE_XAI_API_KEY.substring(0, 10) + '...');
}

if (import.meta.env?.VITE_TWITTER_BEARER_TOKEN) {
  console.log('- Twitter token starts with:', import.meta.env.VITE_TWITTER_BEARER_TOKEN.substring(0, 15) + '...');
}

// Make debugging functions available globally
if (typeof window !== 'undefined') {
  window.checkEnvVars = () => {
    console.log('Environment check:', {
      xaiKey: !!(import.meta.env?.VITE_XAI_API_KEY),
      xaiLength: (import.meta.env?.VITE_XAI_API_KEY || '').length,
      twitterToken: !!(import.meta.env?.VITE_TWITTER_BEARER_TOKEN),
      twitterLength: (import.meta.env?.VITE_TWITTER_BEARER_TOKEN || '').length
    });
  };
}