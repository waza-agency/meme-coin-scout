import React from 'react';
import { TrendingUp, TrendingDown, Minus, MessageCircle, Heart, Frown, Meh } from 'lucide-react';
import { SocialMentionsIndicator as SocialMentionsIndicatorType } from '../types';
import { formatSocialMentionsChange } from '../utils/indicators';

interface SocialMentionsIndicatorProps {
  indicator: SocialMentionsIndicatorType;
  showDetails?: boolean;
  showCount?: boolean;
}

const SocialMentionsIndicator: React.FC<SocialMentionsIndicatorProps> = ({ 
  indicator, 
  showDetails = false,
  showCount = true 
}) => {
  const getBgColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'bg-green-500/20 border-green-500/30';
      case 'down':
        return 'bg-red-500/20 border-red-500/30';
      case 'stable':
        return 'bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    const iconClass = `w-3 h-3 ${indicator.color}`;
    switch (trend) {
      case 'up':
        return <TrendingUp className={iconClass} />;
      case 'down':
        return <TrendingDown className={iconClass} />;
      case 'stable':
        return <Minus className={iconClass} />;
      default:
        return <MessageCircle className={iconClass} />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const iconClass = `w-3 h-3`;
    switch (sentiment) {
      case 'positive':
        return <Heart className={`${iconClass} text-green-400`} />;
      case 'negative':
        return <Frown className={`${iconClass} text-red-400`} />;
      case 'neutral':
        return <Meh className={`${iconClass} text-gray-400`} />;
      default:
        return <MessageCircle className={`${iconClass} text-gray-400`} />;
    }
  };

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${getBgColor(indicator.trend)}`}>
      {getTrendIcon(indicator.trend)}
      
      <div className="flex items-center gap-1">
        <span className={`text-xs font-medium ${indicator.color}`}>
          {indicator.label}
        </span>
        
        {showCount && indicator.current24h > 0 && (
          <span className="text-xs text-gray-300">
            {indicator.current24h}
          </span>
        )}
        
        {indicator.changePercent !== 0 && (
          <span className={`text-xs ${indicator.color}`}>
            {formatSocialMentionsChange(indicator.changePercent)}
          </span>
        )}
      </div>

      {showDetails && (
        <div className="flex items-center gap-1">
          {getSentimentIcon(indicator.sentiment)}
          <span className="text-xs text-gray-400">
            {indicator.confidence}%
          </span>
        </div>
      )}
    </div>
  );
};

export default SocialMentionsIndicator; 