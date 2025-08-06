import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3007;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Twitter API proxy endpoint with enhanced error handling
app.get('/api/twitter/search', async (req, res) => {
  try {
    const { query, max_results = 50, tweet_fields } = req.query;
    
    if (!query) {
      console.error('❌ No query parameter provided');
      return res.status(400).json({ 
        error: 'Query parameter is required',
        code: 'MISSING_QUERY'
      });
    }

    const twitterBearerToken = process.env.VITE_TWITTER_BEARER_TOKEN
      ? decodeURIComponent(process.env.VITE_TWITTER_BEARER_TOKEN)
      : null;
    
    if (!twitterBearerToken) {
      console.error('❌ No Twitter Bearer Token found in environment');
      return res.status(500).json({ 
        error: 'Twitter API not configured - missing bearer token',
        code: 'MISSING_TOKEN',
        hint: 'Add VITE_TWITTER_BEARER_TOKEN to .env.local'
      });
    }

    // Token validation temporarily disabled - let's test the actual API
    console.log('🔍 Debug - Token info:');
    console.log('- Token length:', twitterBearerToken.length);
    console.log('- Token prefix:', twitterBearerToken.substring(0, 30));
    console.log('✅ Proceeding to Twitter API call...');

    console.log(`🐦 Proxy: Searching Twitter for "${query}" (max: ${max_results})`);
    console.log(`🔑 Using token: ${twitterBearerToken.substring(0, 15)}...`);
    
    const response = await axios.get('https://api.x.com/2/tweets/search/recent', {
      params: {
        query: query,
        max_results: Math.min(parseInt(max_results), 100), // Cap at 100
        'tweet.fields': tweet_fields || 'created_at,public_metrics,text,context_annotations,author_id'
      },
      headers: {
        'Authorization': `Bearer ${twitterBearerToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'MemeScreener/1.0'
      },
      timeout: 25000,
    });

    const tweetCount = response.data.data?.length || 0;
    const resultCount = response.data.meta?.result_count || tweetCount;
    
    console.log(`✅ Twitter API success: Found ${tweetCount} tweets (${resultCount} total results)`);
    
    // Add some metadata for debugging
    const responseData = {
      ...response.data,
      _proxy_meta: {
        query: query,
        max_results: max_results,
        actual_results: tweetCount,
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(responseData);
    
  } catch (error) {
    console.error('🚨 Twitter API proxy error:');
    console.error('- Status:', error.response?.status);
    console.error('- Status Text:', error.response?.statusText);
    console.error('- Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('- Message:', error.message);
    
    // Enhanced error responses with actionable information
    if (error.response?.status === 401) {
      console.error('🔑 Twitter authentication failed - token invalid or expired');
      res.status(401).json({ 
        error: 'Twitter API authentication failed',
        code: 'AUTH_FAILED',
        hint: 'Your Bearer Token is invalid or expired. Get a new one from https://developer.twitter.com',
        details: error.response?.data
      });
    } else if (error.response?.status === 403) {
      console.error('🚫 Twitter access forbidden - check token permissions or app status');
      res.status(403).json({ 
        error: 'Twitter API access forbidden',
        code: 'ACCESS_FORBIDDEN',
        hint: 'Your app may be suspended or lacks required permissions. Check your Twitter Developer portal.',
        details: error.response?.data
      });
    } else if (error.response?.status === 429) {
      console.error('⏱️ Twitter rate limit exceeded');
      const resetTime = error.response?.headers?.['x-rate-limit-reset'];
      res.status(429).json({ 
        error: 'Twitter API rate limit exceeded',
        code: 'RATE_LIMITED',
        hint: 'Twitter allows 15 requests per 15 minutes. Wait and try again.',
        reset_time: resetTime ? new Date(resetTime * 1000).toISOString() : null,
        details: error.response?.data
      });
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network connectivity issue');
      res.status(500).json({ 
        error: 'Network connectivity issue',
        code: 'NETWORK_ERROR',
        hint: 'Check internet connection or Twitter API status',
        details: { code: error.code, message: error.message }
      });
    } else if (error.response?.data) {
      // Pass through Twitter API errors with additional context
      res.status(error.response.status || 500).json({
        ...error.response.data,
        _proxy_error: true,
        _proxy_status: error.response.status,
        _proxy_hint: 'This error came directly from Twitter API'
      });
    } else {
      console.error('🚨 Unknown error:', error.message);
      res.status(500).json({ 
        error: 'Twitter API request failed',
        code: 'UNKNOWN_ERROR',
        hint: 'Check server logs for more details',
        message: error.message
      });
    }
  }
});

// DexScreener API proxy endpoint
app.get('/api/dexscreener/tokens/:address', async (req, res) => {
  try {
    const address = req.params.address;
    const queryString = req.url.split('?')[1] || '';
    const fullUrl = `https://api.dexscreener.com/latest/dex/tokens/${address}${queryString ? '?' + queryString : ''}`;
    
    console.log(`🔗 DexScreener proxy: ${fullUrl}`);
    
    const response = await axios.get(fullUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'MemeScreener-App/1.0',
        'Accept': 'application/json'
      }
    });

    console.log(`✅ DexScreener API success: ${response.data?.pairs?.length || 0} pairs`);
    res.json(response.data);
    
  } catch (error) {
    console.error('🚨 DexScreener API proxy error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      res.status(429).json({ error: 'DexScreener API rate limit exceeded' });
    } else if (error.response?.data) {
      res.status(error.response.status || 500).json(error.response.data);
    } else {
      res.status(500).json({ error: 'DexScreener API request failed' });
    }
  }
});

// Reddit API proxy endpoint
app.get('/api/reddit/search', async (req, res) => {
  try {
    const { q, subreddit, sort = 'new', limit = 25 } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        code: 'MISSING_QUERY'
      });
    }

    console.log(`🔍 Reddit search: "${q}" in ${subreddit || 'all'}`);
    
    // Build Reddit URL
    let redditUrl;
    if (subreddit) {
      redditUrl = `https://www.reddit.com/r/${subreddit}/search.json`;
    } else {
      redditUrl = 'https://www.reddit.com/search.json';
    }

    const response = await axios.get(redditUrl, {
      params: {
        q: q,
        sort: sort,
        limit: Math.min(parseInt(limit), 100),
        restrict_sr: subreddit ? 'true' : undefined,
        t: 'week' // Time range: week
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    console.log(`✅ Reddit API success: Found ${response.data.data?.children?.length || 0} posts`);
    res.json(response.data);
    
  } catch (error) {
    console.error('🚨 Reddit API proxy error:', error.message);
    
    if (error.response?.status === 429) {
      res.status(429).json({ 
        error: 'Reddit rate limit exceeded',
        code: 'RATE_LIMITED',
        hint: 'Please wait a few minutes before trying again'
      });
    } else {
      res.status(error.response?.status || 500).json({ 
        error: error.message || 'Reddit API request failed',
        code: 'REDDIT_API_ERROR'
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Twitter API proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/api/twitter/search`);
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💡 Make sure to update frontend to use port ${PORT}`);
});