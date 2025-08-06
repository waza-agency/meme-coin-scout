import { Coin } from '../types';
import { formatMarketCap, calculateAge, getBubblemapsUrl } from '../utils/filters';
import { TrendingUp, TrendingDown, Copy, Users } from 'lucide-react';
import { getRiskLevel } from '../utils/indicators';

interface CoinCardCompactProps {
  coin: Coin;
}

const CoinCardCompact: React.FC<CoinCardCompactProps> = ({ coin }) => {
  const marketCap = coin.marketCap || coin.fdv || 0;
  const age = coin.pairCreatedAt ? calculateAge(coin.pairCreatedAt) : 0;
  const riskLevel = getRiskLevel(coin);
  const momentum = coin.priceChange?.h24 || 0;
  
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
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div 
      className="bg-crypto-gray border border-gray-700 rounded-lg p-3 hover:border-crypto-accent hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-white text-sm">
              {coin.baseToken?.symbol}
            </span>
            {getMomentumIcon()}
          </div>
          <span className="text-xs text-gray-400">
            {age}d
          </span>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor()}`}>
          {riskLevel.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">
          <span className="text-gray-400">MC: </span>
          <span className="text-white font-medium">
            {marketCap ? formatMarketCap(marketCap) : 'N/A'}
          </span>
        </div>
        
        {momentum !== 0 && (
          <div className={`text-sm font-medium ${momentum > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {momentum > 0 ? '+' : ''}{momentum.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400 font-mono">
          {coin.baseToken?.address?.slice(0, 6)}...{coin.baseToken?.address?.slice(-4)}
        </div>
        
        <div className="flex items-center gap-1">
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
            <Users className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(coin.baseToken?.address || '');
            }}
            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
            title="Copy contract address"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinCardCompact;