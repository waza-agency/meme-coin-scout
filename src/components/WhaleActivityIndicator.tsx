import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Eye, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { WhaleActivityIndicator as WhaleActivityIndicatorType } from '../types';

interface WhaleActivityIndicatorProps {
  indicator: WhaleActivityIndicatorType | null;
  isLoading?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const WhaleActivityIndicator: React.FC<WhaleActivityIndicatorProps> = ({
  indicator,
  isLoading = false,
  showDetails = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-300">Loading whale data...</span>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg ${className}`}>
        <AlertTriangle className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">No whale data</span>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (indicator.trend) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityIcon = () => {
    switch (indicator.activity) {
      case 'high':
        return <Activity className="w-3 h-3 text-orange-400" />;
      case 'medium':
        return <Activity className="w-3 h-3 text-yellow-400" />;
      case 'low':
        return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getRiskIcon = () => {
    switch (indicator.riskLevel) {
      case 'high':
        return <AlertTriangle className="w-3 h-3 text-red-400" />;
      case 'medium':
        return <Eye className="w-3 h-3 text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (indicator.trend) {
      case 'bullish':
        return 'bg-green-900/20 border-green-500/30';
      case 'bearish':
        return 'bg-red-900/20 border-red-500/30';
      case 'neutral':
        return 'bg-gray-800/50 border-gray-600/30';
    }
  };

  const getTextColor = () => {
    switch (indicator.trend) {
      case 'bullish':
        return 'text-green-300';
      case 'bearish':
        return 'text-red-300';
      case 'neutral':
        return 'text-gray-300';
    }
  };

  const getHeaderTextColor = () => {
    switch (indicator.trend) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      case 'neutral':
        return 'text-gray-400';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getHeaderTextColor()}`}>
            Whale Activity
          </span>
          {getActivityIcon()}
        </div>
        <div className="flex items-center gap-1">
          {getRiskIcon()}
          <span className={`text-xs font-medium ${getTextColor()}`}>
            {indicator.confidence}%
          </span>
        </div>
      </div>

      <div className="mt-2">
        <div className={`text-sm font-semibold ${getTextColor()}`}>
          {indicator.label}
        </div>
        
        {showDetails && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Activity:</span>
                <span className={`ml-1 font-medium ${getTextColor()}`}>
                  {indicator.activity.charAt(0).toUpperCase() + indicator.activity.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Risk:</span>
                <span className={`ml-1 font-medium ${getTextColor()}`}>
                  {indicator.riskLevel.charAt(0).toUpperCase() + indicator.riskLevel.slice(1)}
                </span>
              </div>
            </div>
            
            {indicator.signals.length > 0 && (
              <div className="pt-2 border-t border-gray-600/30">
                <div className="text-xs text-gray-400 mb-1">Signals:</div>
                <div className="space-y-1">
                  {indicator.signals.map((signal, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                      <span className={`text-xs ${getTextColor()}`}>{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-600/30">
              <div className="text-xs text-gray-400">
                Trend: <span className={`font-medium ${getTextColor()}`}>
                  {indicator.trend.charAt(0).toUpperCase() + indicator.trend.slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhaleActivityIndicator; 