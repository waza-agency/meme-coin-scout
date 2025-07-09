# Whale Activity Tracker

The Whale Activity Tracker monitors large wallet movements and smart money activity to help identify potential opportunities and risks for cryptocurrency tokens.

## What is a "Whale"?

A whale is defined as any wallet that makes transactions above certain USD thresholds. These thresholds vary by blockchain to account for different gas costs and network activity levels:

### Whale Thresholds by Blockchain

| Blockchain | Whale Threshold | Reasoning |
|-----------|----------------|-----------|
| **Ethereum** | $50,000+ | High gas fees mean large transactions are more significant |
| **BSC** | $25,000+ | Moderate gas fees, high activity network |
| **Polygon** | $10,000+ | Low gas fees allow for more frequent large transactions |
| **Arbitrum** | $25,000+ | Layer 2 with moderate costs |
| **Avalanche** | $15,000+ | Fast, low-cost network |

## Whale Activity Indicators

### Trend Classifications

- **🐋📈 Bullish**: Net flow > +$50,000 in 24h (strong accumulation)
- **🐋📉 Bearish**: Net flow < -$50,000 in 24h (heavy selling)
- **🐋➡️ Neutral**: Net flow between -$50,000 and +$50,000 (balanced activity)

### Activity Levels

- **High**: Total volume > $500,000 in 24h
- **Medium**: Total volume $100,000 - $500,000 in 24h
- **Low**: Total volume < $100,000 in 24h

### Risk Levels

- **🔴 High Risk**: Net flow < -$200,000 (major selling pressure)
- **🟡 Medium Risk**: Net flow between -$200,000 and -$50,000 (moderate selling)
- **🟢 Low Risk**: Net flow > -$50,000 (minimal selling pressure)

## Smart Money Tracking

The system tracks known smart money wallets including:

### Exchange Wallets
- Binance (multiple hot wallets)
- Coinbase
- Kraken
- KuCoin
- OKEx

### Institutional Wallets
- Alameda Research
- Jump Trading
- Various DeFi protocols

### Confidence Scoring

Confidence is calculated based on:
- **Whale Count** (40% weight): More unique whales = higher confidence
- **Volume** (30% weight): Higher volume = more reliable signals
- **Smart Money** (30% weight): Smart money involvement increases confidence

## Signals Generated

### Bullish Signals
- **Strong accumulation**: Net flow > +$100,000
- **High whale interest**: 10+ unique whales active
- **Smart money following**: 2+ smart money wallets involved
- **Recent smart money activity**: Smart money transactions in last 24h
- **Large transaction detected**: Single transaction > $200,000

### Bearish Signals
- **Heavy selling**: Net flow < -$100,000
- **Whale distribution**: Large outflows from whale wallets

## How to Use

### In the Coin Cards
The whale activity indicator appears as a colored badge showing:
- Trend icon (📈/📉/➡️)
- Net flow amount
- Number of active whales
- Confidence percentage

### Interpreting the Data

**Look for:**
- ✅ Strong accumulation with high confidence
- ✅ Smart money following with recent activity
- ✅ Multiple whales accumulating consistently

**Avoid:**
- ❌ Heavy selling with high confidence
- ❌ Large negative net flows
- ❌ Smart money selling/exiting

## Data Sources

The whale tracker uses multiple data sources:

1. **Blockchain APIs**: Etherscan, BSCScan, PolygonScan, etc.
2. **Fallback Services**: DeFiLlama, Moralis (when available)
3. **Heuristic Estimation**: Based on market cap and volume when APIs fail

## Rate Limits and Caching

- **API Calls**: Rate limited to 200ms between requests
- **Caching**: 5-minute cache for all whale data
- **Timeout**: 10-second timeout for API requests

## Privacy and Security

- Only public blockchain data is analyzed
- No private wallet information is stored
- All data is aggregated and anonymized
- Known exchange addresses are labeled for transparency

## Performance Considerations

- Data is cached to minimize API calls
- Requests are rate-limited to prevent API abuse
- Graceful fallbacks when services are unavailable
- Heuristic estimation provides continuity

## Example Interpretations

### 🚀 Strong Buy Signal
```
Trend: Bullish 🐋📈
Activity: High
Net Flow: +$150,000 (8 whales)
Confidence: 85%
Signals: Strong accumulation, High whale interest, Smart money following
```

### ⚠️ Caution Signal
```
Trend: Bearish 🐋📉
Activity: Medium
Net Flow: -$120,000 (6 whales)
Confidence: 72%
Signals: Heavy selling, Large transaction detected
```

### 😐 Neutral Signal
```
Trend: Neutral 🐋➡️
Activity: Low
Net Flow: +$15,000 (3 whales)
Confidence: 45%
Signals: None
```

## Best Practices

1. **Combine with Other Indicators**: Use alongside liquidity, risk, and social metrics
2. **Consider Timeframes**: Look at both 24h and 7d trends
3. **Watch Confidence Levels**: Higher confidence = more reliable signals
4. **Monitor Smart Money**: Smart money activity often precedes major moves
5. **Check Volume**: High activity levels provide more reliable signals

## Limitations

- API dependencies may cause temporary data gaps
- Some transactions may be misclassified (DEX vs whale)
- Cross-chain transactions are not tracked
- Private/anonymous wallets cannot be labeled
- Historical data is limited to recent transactions

## Future Enhancements

- Real-time whale alerts
- Historical trend analysis
- Cross-chain transaction tracking
- Advanced smart money identification
- Custom whale threshold settings 