import React from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { TechnicalData, TechnicalSignal } from '../types';

interface TechnicalAnalysisIndicatorProps {
  data: TechnicalData;
  showDetails?: boolean;
}

export const TechnicalAnalysisIndicator: React.FC<TechnicalAnalysisIndicatorProps> = ({ 
  data, 
  showDetails = false 
}) => {
  const getSignalIcon = (signal: TechnicalSignal) => {
    switch (signal.type) {
      case 'rsi':
        return <Activity className="w-3 h-3" />;
      case 'volume':
        return <TrendingUp className="w-3 h-3" />;
      case 'momentum':
        return <Activity className="w-3 h-3" />;
      case 'support':
        return <CheckCircle className="w-3 h-3" />;
      case 'resistance':
        return <AlertTriangle className="w-3 h-3" />;
      case 'trend':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getSignalColor = (signal: TechnicalSignal) => {
    switch (signal.direction) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRSIColor = (rsi: number) => {
    if (rsi < 30) return 'text-green-400'; // Oversold - potential buy
    if (rsi > 70) return 'text-red-400'; // Overbought - potential sell
    return 'text-gray-300';
  };

  const getVolumeColor = (ratio: number) => {
    if (ratio > 2) return 'text-orange-400'; // Volume spike
    if (ratio > 1.5) return 'text-green-400'; // Above average
    if (ratio < 0.5) return 'text-red-400'; // Below average
    return 'text-gray-300';
  };

  const getMomentumColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  const getMomentumIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const prioritySignals = data.signals
    .filter(s => s.confidence > 60)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Technical Analysis</h3>
        <div className="flex items-center gap-2">
          {data.signals.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-gray-400">{data.signals.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* RSI */}
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">RSI</div>
          <div className={`text-lg font-semibold ${getRSIColor(data.indicators.rsi)}`}>
            {data.indicators.rsi}
          </div>
          <div className="text-xs text-gray-500">
            {data.indicators.rsi < 30 ? 'Oversold' : data.indicators.rsi > 70 ? 'Overbought' : 'Normal'}
          </div>
        </div>

        {/* Volume */}
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Volume</div>
          <div className={`text-lg font-semibold ${getVolumeColor(data.indicators.volume.ratio)}`}>
            {data.indicators.volume.ratio.toFixed(1)}x
          </div>
          <div className="text-xs text-gray-500">
            {data.indicators.volume.ratio > 2 ? 'Spike' : data.indicators.volume.ratio > 1.5 ? 'High' : data.indicators.volume.ratio < 0.5 ? 'Low' : 'Normal'}
          </div>
        </div>

        {/* Momentum */}
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Momentum</div>
          <div className={`flex items-center justify-center gap-1 ${getMomentumColor(data.indicators.momentum.direction)}`}>
            {getMomentumIcon(data.indicators.momentum.direction)}
            <span className="text-xs font-medium">
              {data.indicators.momentum.direction}
            </span>
          </div>
          <div className="text-xs text-gray-500">{data.indicators.momentum.strength}%</div>
        </div>
      </div>

      {/* Priority Signals */}
      {prioritySignals.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <div className="text-xs text-gray-400 mb-2">Key Signals</div>
          <div className="space-y-2">
            {prioritySignals.map((signal, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`flex-shrink-0 mt-0.5 ${getSignalColor(signal)}`}>
                  {getSignalIcon(signal)}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-medium ${getSignalColor(signal)}`}>
                    {signal.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {signal.strength} • {signal.confidence}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="space-y-4">
            {/* RSI Details */}
            <div>
              <div className="text-xs text-gray-400 mb-2">RSI Analysis</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Value:</span>
                  <span className={`ml-2 font-medium ${getRSIColor(data.indicators.rsi)}`}>
                    {data.indicators.rsi}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Level:</span>
                  <span className="ml-2 text-gray-300">
                    {data.indicators.rsi < 30 ? 'Oversold' : data.indicators.rsi > 70 ? 'Overbought' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Volume Details */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Volume Analysis</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Current:</span>
                  <span className="ml-2 text-gray-300">
                    ${data.indicators.volume.current.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Average:</span>
                  <span className="ml-2 text-gray-300">
                    ${data.indicators.volume.average.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Ratio:</span>
                  <span className="ml-2 text-gray-300">
                    {data.indicators.volume.ratio.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>

            {/* Momentum Details */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Momentum Analysis</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Score:</span>
                  <span className="ml-2 text-gray-300">
                    {data.indicators.momentum.score.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Direction:</span>
                  <span className="ml-2 text-gray-300">
                    {data.indicators.momentum.direction}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Strength:</span>
                  <span className="ml-2 text-gray-300">
                    {data.indicators.momentum.strength}%
                  </span>
                </div>
              </div>
            </div>

            {/* Support/Resistance */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Support & Resistance</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Support:</span>
                  <span className="ml-2 text-gray-300">
                    ${data.indicators.support.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Resistance:</span>
                  <span className="ml-2 text-gray-300">
                    ${data.indicators.resistance.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Sentiment */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Overall Assessment</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Sentiment:</span>
                  <span className={`ml-2 font-medium ${
                    data.overallSentiment === 'bullish' ? 'text-green-400' : 
                    data.overallSentiment === 'bearish' ? 'text-red-400' : 
                    'text-gray-300'
                  }`}>
                    {data.overallSentiment}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Confidence:</span>
                  <span className="ml-2 text-gray-300">
                    {data.confidenceScore}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Risk:</span>
                  <span className={`ml-2 font-medium ${
                    data.riskLevel === 'high' ? 'text-red-400' : 
                    data.riskLevel === 'medium' ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}>
                    {data.riskLevel}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Action:</span>
                  <span className={`ml-2 font-medium ${
                    data.entrySignal.action === 'buy' ? 'text-green-400' : 
                    data.entrySignal.action === 'sell' ? 'text-red-400' : 
                    'text-gray-300'
                  }`}>
                    {data.entrySignal.action}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 