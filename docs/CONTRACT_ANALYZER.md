# Contract Analyzer

The Contract Analyzer is a powerful feature that allows users to perform detailed analysis of any specific token by entering its contract address. This provides comprehensive insights using all the analysis tools built into the MemeScreener.

## Features

### 🔍 **Multi-Chain Support**
- **Ethereum**: Standard ERC-20 tokens (0x... addresses)
- **Solana**: SPL tokens (base58 addresses)
- **BSC, Polygon, Arbitrum**: EVM-compatible tokens
- **Auto-detection**: Automatically validates address format

### 📊 **Comprehensive Analysis**

#### **Core Indicators**
- **Liquidity Analysis**: Pool depth and trading capability
- **Risk Assessment**: Smart contract and rug pull risks
- **Social Sentiment**: Real-time mentions and community buzz
- **Whale Activity**: Large holder movements and patterns

#### **Advanced Analytics**
- **Technical Analysis**: RSI, volume patterns, accumulation signals
- **Holder Distribution**: Concentration risk and whale analysis
- **Entry Timing**: Optimal buy/sell zone identification
- **Risk Management**: Multi-dimensional risk scoring

## How to Use

### 1. **Enter Contract Address**
```
Ethereum/BSC/Polygon: 0x1234567890abcdef1234567890abcdef12345678
Solana: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### 2. **Click Analyze**
The system will:
- Fetch token information from DexScreener
- Run all analysis modules in parallel
- Display comprehensive results

### 3. **Review Results**
- **Token Overview**: Basic info, market cap, liquidity
- **Quick Indicators**: Visual risk and opportunity signals
- **Detailed Analysis**: In-depth technical and holder data
- **Social Metrics**: Community engagement and sentiment

## Analysis Components

### **Token Header**
- Token name, symbol, and logo
- Market cap and liquidity
- Token age and DEX information
- Direct link to DexScreener

### **Indicator Grid**
- **Liquidity Indicator**: Pool depth analysis
- **Risk Indicator**: Multi-factor risk assessment
- **Social Indicator**: Community sentiment and activity
- **Whale Indicator**: Large holder activity patterns

### **Technical Analysis**
- **RSI Analysis**: Overbought/oversold conditions
- **Volume Patterns**: Unusual trading activity detection
- **Accumulation Signals**: Smart money movement patterns
- **Entry Timing**: Optimal trading opportunities

### **Holder Analysis**
- **Concentration Risk**: Top holder distribution analysis
- **Distribution Health**: Token spread evaluation
- **Liquidity Risk**: LP concentration and unlock schedules
- **Whale Patterns**: Large holder behavior analysis

### **Social Activity**
- **24h Mentions**: Social media activity count
- **Sentiment Analysis**: Community mood assessment
- **Reach Metrics**: Total audience engagement
- **Trend Changes**: Growth/decline patterns

### **Whale Activity**
- **Active Whales**: Number of large holders trading
- **Net Flow**: Accumulation vs distribution
- **Buy/Sell Ratio**: Whale trading patterns
- **Flow Analysis**: Money movement tracking

## Supported Blockchains

| Blockchain | Address Format | Example |
|------------|----------------|---------|
| Ethereum | 0x... (42 chars) | 0x1234...5678 |
| Solana | Base58 (32-44 chars) | 7xKXt...gsU |
| BSC | 0x... (42 chars) | 0xabcd...efgh |
| Polygon | 0x... (42 chars) | 0x9876...1234 |
| Arbitrum | 0x... (42 chars) | 0xfedc...4321 |

## API Integrations

### **DexScreener API**
- Token pair information
- Price and volume data
- Liquidity pool details
- Trading history

### **Analysis Services**
- **RugCheck**: Solana token security analysis
- **Social APIs**: Twitter, Telegram, Discord mentions
- **Blockchain APIs**: On-chain whale activity
- **Technical Indicators**: Price and volume analysis

## Use Cases

### **🎯 Due Diligence**
Before investing in a token:
- Check holder concentration
- Analyze whale activity
- Review social sentiment
- Assess technical indicators

### **📈 Entry Timing**
Find optimal entry points:
- RSI oversold conditions
- Volume accumulation patterns
- Whale buying activity
- Social buzz increase

### **⚠️ Risk Assessment**
Identify potential red flags:
- Extreme holder concentration
- Recent whale dumping
- Negative social sentiment
- Technical breakdown signals

### **🔍 Research Tool**
Deep dive into specific tokens:
- Compare against benchmarks
- Track changes over time
- Validate community claims
- Research investment thesis

## Best Practices

### **Address Validation**
- Double-check contract addresses
- Verify on blockchain explorers
- Be cautious of similar addresses
- Use official sources when possible

### **Analysis Interpretation**
- **Green Indicators**: Generally positive signals
- **Yellow Indicators**: Caution or neutral signals
- **Red Indicators**: Warning or negative signals
- **Multiple Confirmations**: Look for signal alignment

### **Risk Management**
- Never invest based on single indicator
- Consider multiple timeframes
- Monitor whale activity changes
- Pay attention to concentration risks

## Limitations

### **Data Availability**
- Analysis quality depends on data availability
- New tokens may have limited historical data
- Some APIs may have rate limits
- Real-time data may have delays

### **Market Conditions**
- Analysis is point-in-time snapshot
- Market conditions change rapidly
- External events can override technical signals
- Social sentiment can be manipulated

### **Not Financial Advice**
- Tool provides information, not recommendations
- Users must make their own investment decisions
- Consider consulting financial professionals
- Understand risks before investing

## Troubleshooting

### **Common Issues**
| Issue | Solution |
|-------|----------|
| "Token not found" | Verify contract address format |
| "Analysis failed" | Check network connection |
| "Invalid address" | Ensure correct blockchain selected |
| "No trading pairs" | Token may not be actively traded |

### **Error Messages**
- **Invalid Contract Address**: Check address format and blockchain
- **Token Not Found**: Verify address exists and has trading pairs
- **Analysis Failed**: Network issue or API limitations
- **No Data Available**: Token may be too new or inactive

## Future Enhancements

### **Planned Features**
- **Portfolio Analysis**: Multiple token comparison
- **Alerts System**: Notification for significant changes
- **Historical Data**: Track token performance over time
- **Advanced Charts**: Visual technical analysis tools

### **Additional Metrics**
- **Price Predictions**: ML-based forecasting
- **Correlation Analysis**: Token relationship mapping
- **Market Sentiment**: Broader market context
- **News Integration**: Real-time news impact analysis

---

For technical support or feature requests, please refer to the main project documentation or create an issue in the project repository. 