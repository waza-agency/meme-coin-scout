import { Coin } from '../types';
import { formatMarketCap, calculateAge, getBubblemapsUrl } from '../utils/filters';
import { TrendingUp, TrendingDown, Droplets, Clock, Copy, ExternalLink, Users } from 'lucide-react';
import { getRiskLevel } from '../utils/indicators';

interface CoinCardMediumProps {
  coin: Coin;
}

const CoinCardMedium: React.FC<CoinCardMediumProps> = ({ coin }) => {
  const marketCap = coin.marketCap || coin.fdv || 0;
  const age = coin.pairCreatedAt ? calculateAge(coin.pairCreatedAt) : 0;
  const riskLevel = getRiskLevel(coin);
  const momentum = coin.priceChange?.h24 || 0;
  const volume24h = coin.volume?.h24 || 0;
  const liquidity = coin.liquidity?.usd || 0;
  const price = parseFloat(coin.priceUsd || '0');
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClick = () => {
    window.open(coin.url, '_blank');
  };

  const getMomentumIcon = () => {
    if (momentum > 5) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (momentum < -5) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4" />;
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div 
      className="bg-crypto-gray border border-gray-700 rounded-lg p-4 hover:border-crypto-accent hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">
              {coin.baseToken?.symbol}
            </span>
            {getMomentumIcon()}
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{age}d old</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor()}`}>
            {riskLevel.toUpperCase()}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const bubblemapsUrl = getBubblemapsUrl(coin);
              if (bubblemapsUrl) {
                window.open(bubblemapsUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
            title="View holder distribution on Bubblemaps"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(coin.url, '_blank');
            }}
            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
            title="Open in DexScreener"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Token Name */}
      <div className="text-sm text-gray-400 mb-3 truncate">
        {coin.baseToken?.name}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">Market Cap</div>
          <div className="text-white font-semibold">
            {marketCap ? formatMarketCap(marketCap) : 'N/A'}
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-400 mb-1">Price</div>
          <div className="text-white font-semibold">
            {price > 0 ? `$${price.toFixed(8)}` : 'N/A'}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            Liquidity
          </div>
          <div className="text-white font-semibold">
            {liquidity ? formatValue(liquidity) : 'N/A'}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-1">24h Volume</div>
          <div className="text-white font-semibold">
            {volume24h ? formatValue(volume24h) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Price Change */}
      {momentum !== 0 && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">24h Change</span>
          <div className={`text-sm font-semibold flex items-center gap-1 ${
            momentum > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {momentum > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {momentum > 0 ? '+' : ''}{momentum.toFixed(2)}%
          </div>
        </div>
      )}

      {/* Contract Address */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 font-mono">
          {coin.baseToken?.address?.slice(0, 8)}...{coin.baseToken?.address?.slice(-6)}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(coin.baseToken?.address || '');
          }}
          className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
          title="Copy contract address"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CoinCardMedium;