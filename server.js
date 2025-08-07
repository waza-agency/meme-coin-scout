import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3007;

// Dynamic CORS configuration based on environment
const getAllowedOrigins = () => {
  // Read from environment variable, fallback to default localhost origins for development
  const envOrigins = process.env.VITE_CORS_ORIGINS;
  
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default origins for local development
  return [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://localhost:5173', // Vite default port
    'http://localhost:4173'  // Vite preview port
  ];
};

// Enable CORS for frontend
app.use(cors({
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Accept-Language', 'Accept-Encoding', 'Connection', 'Upgrade-Insecure-Requests', 'Sec-Fetch-Dest', 'Sec-Fetch-Mode', 'Sec-Fetch-Site', 'Cache-Control'],
  credentials: true
}));

app.use(express.json());

// DexScreener API proxy endpoint
app.get('/api/dexscreener/tokens/:address', async (req, res) => {
  try {
    const address = req.params.address;
    
    // Whitelist allowed query parameters for DexScreener API
    const allowedParams = ['chain', 'include', 'exclude', 'boosts'];
    const sanitizedQuery = {};
    
    // Only include whitelisted parameters
    Object.keys(req.query).forEach(key => {
      if (allowedParams.includes(key) && req.query[key]) {
        sanitizedQuery[key] = req.query[key];
      }
    });
    
    // Build sanitized query string
    const queryString = new URLSearchParams(sanitizedQuery).toString();
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


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 API proxy server running on http://localhost:${PORT}`);
  console.log(`📡 DexScreener endpoint: http://localhost:${PORT}/api/dexscreener/tokens`);
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💡 Make sure to update frontend to use port ${PORT}`);
});