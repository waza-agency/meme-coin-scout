import axios from 'axios';

const X_API_BASE_URL = 'https://api.x.com/2';

// XAI API REMOVED - NO SYNTHETIC DATA ALLOWED

export async function testTwitterAPIDirectly() {
  const twitterBearerToken = (import.meta as any).env?.VITE_TWITTER_BEARER_TOKEN || '';
  
  if (!twitterBearerToken) {
    console.error('❌ No TWITTER_BEARER_TOKEN found in environment variables');
    return { success: false, error: 'Missing bearer token' };
  }

  console.log('🔑 Testing Twitter API directly with token length:', twitterBearerToken.length);
  console.log('🔑 Token prefix:', twitterBearerToken.substring(0, 15) + '...');
  
  try {
    const response = await axios.get(`${X_API_BASE_URL}/tweets/search/recent`, {
      params: {
        query: 'hello -is:retweet lang:en',
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics'
      },
      headers: {
        'Authorization': `Bearer ${twitterBearerToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Twitter API direct test successful, found tweets:', response.data.data?.length || 0);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Twitter API direct test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    return { success: false, error: error.response?.data || error.message, status: error.response?.status };
  }
}

export async function testSocialAPIs() {
  console.log('🧪 Testing Social Media APIs...');
  
  try {
    // Social mentions service has been removed
    const result = null;
    
    if (result) {
      console.log('✅ Social API Test Successful!');
      console.log('- Full result object:', result);
      return { success: true, data: result };
    } else {
      console.log('❌ Social API returned null - this means both APIs failed');
      console.log('💡 Check the console for specific API error messages above');
      return { success: false, error: 'Both APIs returned null - check logs above for specific errors' };
    }
  } catch (error: any) {
    console.error('❌ Social API Test Failed:', error.message);
    
    // Provide specific guidance based on error
    if (error.message?.includes('INSUFFICIENT_CREDITS')) {
      console.error('💳 ACTION REQUIRED: Add credits at https://console.x.ai/');
    } else if (error.message?.includes('INVALID_API_KEY')) {
      console.error('🔑 ACTION REQUIRED: Check your API keys in .env.local');
    } else if (error.message?.includes('RATE_LIMIT')) {
      console.error('⏱️ Try again in a few minutes');
    }
    
    return { success: false, error: error.message };
  }
}

export async function debugSocialMentions() {
  console.log('🔍 Debugging social mentions service (REAL DATA ONLY)...');
  
  // Check environment variables
  const twitterToken = (import.meta as any).env?.VITE_TWITTER_BEARER_TOKEN || '';
  
  console.log('📋 Environment check:');
  console.log('- Twitter token present:', !!twitterToken);
  console.log('- Twitter token length:', twitterToken.length);
  
  if (!twitterToken) {
    console.error('❌ No Twitter Bearer Token found in environment variables');
    console.error('🚫 NO SYNTHETIC DATA WILL BE PROVIDED');
    return;
  }
  
  // Test Twitter API directly
  console.log('\n🧪 Testing Twitter API directly...');
  const twitterResult = await testTwitterAPIDirectly();
  console.log('Twitter result:', twitterResult);
  
  // Test through service
  console.log('\n📱 Testing through service layer...');
  const serviceResult = await testSocialAPIs();
  console.log('Service result:', serviceResult);
}

// Auto-run test if this file is accessed
if (typeof window !== 'undefined') {
  (window as any).testSocialAPIs = testSocialAPIs;
  (window as any).testTwitterAPIDirectly = testTwitterAPIDirectly;
  (window as any).debugSocialMentions = debugSocialMentions;
  console.log('💡 Available test functions in console (REAL DATA ONLY):');
  console.log('- testSocialAPIs() - Test through service layer');
  console.log('- testTwitterAPIDirectly() - Test Twitter API directly');
  console.log('- debugSocialMentions() - Complete debugging of social mentions');
  console.log('🚫 NO SYNTHETIC DATA - ONLY REAL TWITTER DATA');
}