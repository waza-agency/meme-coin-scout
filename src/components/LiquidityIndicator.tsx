import React from 'react';
import { Droplets } from 'lucide-react';
import { LiquidityIndicator as LiquidityIndicatorType, formatLiquidity } from '../utils/indicators';

interface LiquidityIndicatorProps {
  indicator: LiquidityIndicatorType;
  showValue?: boolean;
}

const LiquidityIndicator: React.FC<LiquidityIndicatorProps> = ({ 
  indicator, 
  showValue = true 
}) => {
  const getBgColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-500/20 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getIconColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${getBgColor(indicator.level)}`}>
      <Droplets className={`w-3 h-3 ${getIconColor(indicator.level)}`} />
      <span className={`text-xs font-medium ${indicator.color}`}>
        {indicator.label}
      </span>
      {showValue && (
        <span className="text-xs text-gray-300">
          {formatLiquidity(indicator.value)}
        </span>
      )}
    </div>
  );
};

export default LiquidityIndicator; 