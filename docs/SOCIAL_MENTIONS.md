# Social Mentions Feature

The social mentions indicator tracks X (Twitter) activity for cryptocurrency tokens in real-time using the official X API v2. This feature provides authentic social sentiment data without any fallback estimations.

## Overview

The social mentions system monitors X activity for tokens by:
- Searching for token mentions across various formats ($TOKEN, TOKEN, "TOKEN", etc.)
- Analyzing sentiment using comprehensive crypto-specific keywords
- Calculating engagement metrics and reach
- Comparing current vs. previous 24-hour activity
- Providing real-time social sentiment indicators

## Data Sources

### X (Twitter) API v2
- **Authentication**: Requires Bearer Token
- **Rate Limits**: Standard X API limits apply
- **Accuracy**: High accuracy with real social data
- **Coverage**: Global X platform coverage
- **Real-time**: Live data with minimal delay

## Setup Instructions

### Required: X API Bearer Token

The social mentions feature requires a valid X API Bearer Token. **No mock or estimated data is provided.**

1. **Get X API Access**:
   - Apply for X Developer Account at [developer.twitter.com](https://developer.twitter.com)
   - Create a new app in your developer dashboard
   - Generate Bearer Token from your app settings

2. **Configure Environment Variable**:
   ```bash
   # .env.local
   VITE_X_BEARER_TOKEN=your_bearer_token_here
   ```

3. **Initialize Service**:
   ```typescript
   import { socialMentionsService } from '../services/social-mentions';
   
   // Service automatically uses environment variable
   const data = await socialMentionsService.searchMentions('BTC', '24h');
   ```

### Manual Token Configuration

```typescript
import { SocialMentionsService } from '../services/social-mentions';

// Initialize with specific Bearer Token
const service = new SocialMentionsService('your-bearer-token');
const data = await service.searchMentions('BTC', '24h');
```

## Indicator Levels

### Trend Classification
- **Trending Up**: >20% increase in mentions (Green indicator)
- **Trending Down**: >20% decrease in mentions (Red indicator)  
- **Stable**: -20% to +20% change (Yellow indicator)

### Confidence Levels
- **100%**: 50+ mentions (Very reliable)
- **80%**: 20-49 mentions (Reliable)
- **60%**: 10-19 mentions (Moderate)
- **40%**: 5-9 mentions (Low)
- **20%**: <5 mentions (Very low)

### Sentiment Analysis
- **Positive**: bullish, moon, pump, rocket, hodl, diamond, hands, accumulate, etc.
- **Negative**: scam, rug, rugpull, crash, dump, liquidated, rekt, avoid, etc.
- **Neutral**: No strong sentiment indicators or balanced sentiment

## Usage Examples

### Basic Usage in Components

```typescript
import { useState, useEffect } from 'react';
import { socialMentionsService } from '../services/social-mentions';
import { calculateSocialMentionsIndicator } from '../utils/indicators';

function TokenCard({ tokenSymbol }) {
  const [socialData, setSocialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSocialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await socialMentionsService.searchMentions(tokenSymbol, '24h');
        setSocialData(data);
      } catch (error) {
        console.error('Failed to fetch social data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialData();
  }, [tokenSymbol]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const indicator = calculateSocialMentionsIndicator(socialData);

  return (
    <div>
      <SocialMentionsIndicator 
        indicator={indicator}
        showCount={true}
        showDetails={true}
      />
      {loading && <span>Loading social data...</span>}
    </div>
  );
}
```

### Error Handling

```typescript
try {
  const data = await socialMentionsService.searchMentions('TOKEN', '24h');
  // Process data
} catch (error) {
  if (error.message.includes('Bearer Token')) {
    console.error('X API not configured. Please set VITE_X_BEARER_TOKEN');
    // Show configuration instructions to user
  } else if (error.message.includes('rate limit')) {
    console.error('X API rate limit exceeded. Please wait before retrying.');
    // Implement retry logic with exponential backoff
  } else {
    console.error('Unexpected error:', error);
    // Handle other errors
  }
}
```

## Testing

The social mentions feature includes comprehensive tests:

```bash
# Run social mentions tests
npm test src/test/services/social-mentions.test.ts
npm test src/test/utils/social-mentions-indicators.test.ts
npm test src/test/components/SocialMentionsIndicator.test.tsx
```

## API Rate Limits

### X API v2 Rate Limits
- **Essential Access**: 500,000 tweets/month
- **Elevated Access**: 2,000,000 tweets/month  
- **Academic Research**: 10,000,000 tweets/month

### Best Practices
1. **Implement Caching**: Cache results for 5-10 minutes to reduce API calls
2. **Respect Rate Limits**: Monitor your usage in X Developer Dashboard
3. **Retry Logic**: Implement exponential backoff for rate limit errors
4. **Batch Requests**: Group multiple token requests when possible

```typescript
// Example caching implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedSocialData(symbol: string) {
  const cacheKey = `social-${symbol}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await socialMentionsService.searchMentions(symbol, '24h');
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}
```

## Troubleshooting

### Common Issues

1. **"X API Bearer Token is required"**
   - Set `VITE_X_BEARER_TOKEN` environment variable
   - Ensure your X Developer account is approved
   - Verify Bearer Token is valid and active

2. **Rate limit errors**
   - Check your X Developer Dashboard for usage
   - Implement caching to reduce API calls
   - Consider upgrading your X API access tier

3. **No data returned**
   - Verify token symbol is correct and commonly mentioned
   - Check if token has recent social activity
   - Ensure X API is not experiencing outages

4. **Authentication errors**
   - Regenerate Bearer Token in X Developer Dashboard
   - Verify Bearer Token format (should start with "Bearer ")
   - Check if your X app has proper permissions

### Performance Optimization

1. **Implement Request Debouncing**:
   ```typescript
   import { debounce } from 'lodash';
   
   const debouncedFetch = debounce(
     (symbol) => socialMentionsService.searchMentions(symbol, '24h'),
     1000
   );
   ```

2. **Use AbortController for Cleanup**:
   ```typescript
   useEffect(() => {
     const controller = new AbortController();
     
     fetchSocialData(controller.signal);
     
     return () => controller.abort();
   }, [tokenSymbol]);
   ```

## Data Privacy and Compliance

The social mentions service:
- Only accesses publicly available X data
- Respects X API terms of service and rate limits
- Does not store user credentials or personal information
- Complies with X Developer Agreement
- Uses official X API v2 endpoints exclusively

## Contributing

To extend the social mentions functionality:

1. Add new sentiment keywords in the `analyzeTweetSentiment` method
2. Enhance search query building in `buildSearchQuery` method
3. Implement additional engagement metrics in reach calculations
4. Add support for different time ranges (7d, 30d)
5. Create comprehensive tests for any new features

## Support

For issues related to:
- **X API**: Check [X Developer Documentation](https://developer.twitter.com/en/docs)
- **Rate Limits**: Review your usage in [X Developer Dashboard](https://developer.twitter.com/en/portal/dashboard)
- **Feature Requests**: Open an issue in the project repository 