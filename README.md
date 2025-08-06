# Meme Coin Screener

A specialized web-based tool for sophisticated cryptocurrency traders to identify early-stage meme coin opportunities across multiple blockchains.

## Features

- **Multi-blockchain Support**: Screen coins on Solana, Sui, Base, and Tron
- **Advanced Filtering**: Filter by market cap range and coin age
- **Real-time Data**: Fetches live data from DexScreener API
- **Social Sentiment Analysis**: Reddit-powered social mentions (free) with Twitter fallback (premium)
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Direct Integration**: Click any coin to view detailed analysis on DexScreener

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom crypto-themed design
- **Data Source**: DexScreener Public API
- **Build Tool**: Vite
- **Testing**: Vitest with React Testing Library

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MemeScreener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Configure Social Mentions (Optional)**
   Create a `.env.local` file in the root directory:
   ```env
   # Social Mentions Configuration
   VITE_USE_REDDIT_SOCIAL=true                    # Use Reddit (free, default)
   VITE_TWITTER_BEARER_TOKEN=your_twitter_token   # For Twitter fallback (optional)
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Social Mentions Feature

The app now includes social sentiment analysis with two data sources:

### Reddit Integration (Default - FREE)
- ✅ **No API keys required**
- ✅ **No rate limits**
- ✅ **Real-time data from crypto subreddits**
- Searches across: r/cryptocurrency, r/CryptoMoonShots, r/SatoshiStreetBets, and more
- Analyzes sentiment using keyword matching and engagement metrics
- Provides detailed mention analysis with source attribution

### Twitter Integration (Fallback - PREMIUM)
- 🔑 **Requires Twitter API Bearer Token**
- ⏱️ **Rate limited (15 requests per 15 minutes)**
- 🐦 **Official Twitter API v2 integration**
- Used automatically when Reddit data is insufficient (if token provided)

### Configuration Options
```env
# Use Reddit as primary (recommended)
VITE_USE_REDDIT_SOCIAL=true

# Use Twitter as primary (requires API key)
VITE_USE_REDDIT_SOCIAL=false
VITE_TWITTER_BEARER_TOKEN=your_bearer_token

# Hybrid mode: Reddit primary, Twitter fallback
VITE_USE_REDDIT_SOCIAL=true
VITE_TWITTER_BEARER_TOKEN=your_bearer_token
```

## Usage

1. **Select Blockchain**: Choose from Solana, Sui, Base, or Tron
2. **Set Filters**: 
   - Market Cap Range (USD)
   - Age Range (Days)
3. **Apply & Reload**: Click the button to fetch and filter results
4. **Browse Results**: View matching coins in an intuitive grid layout
5. **Analyze**: Click any coin card to open detailed analysis on DexScreener

## API Strategy

The application uses a comprehensive approach to ensure maximum coin discovery:

- **Parallel Requests**: Makes simultaneous API calls for different quote tokens
- **Data Aggregation**: Merges and deduplicates results from multiple queries
- **CORS Handling**: Uses reliable CORS proxies for cross-origin requests
- **Error Resilience**: Implements retry logic with fallback proxies

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

### Project Structure

```
src/
├── components/          # React components
├── config/             # Configuration files
├── services/           # API services
├── types/              # TypeScript interfaces
├── utils/              # Utility functions
└── test/               # Test setup
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This tool is for educational and research purposes only. Cryptocurrency trading involves significant risk. Always do your own research and never invest more than you can afford to lose. 