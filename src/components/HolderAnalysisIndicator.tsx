import React from 'react';
import { AlertTriangle, Users, Activity, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { HolderAnalysisData, HolderSignal } from '../services/holder-analysis';

interface HolderAnalysisIndicatorProps {
  data: HolderAnalysisData;
  showDetails?: boolean;
}

export const HolderAnalysisIndicator: React.FC<HolderAnalysisIndicatorProps> = ({ 
  data, 
  showDetails = false 
}) => {
  const getConcentrationColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDistributionColor = (pattern: string) => {
    switch (pattern) {
      case 'concentrated':
        return 'text-red-400';
      case 'distributed':
        return 'text-green-400';
      case 'balanced':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSignalIcon = (signal: HolderSignal) => {
    switch (signal.type) {
      case 'concentration':
        return <AlertTriangle className="w-3 h-3" />;
      case 'distribution':
        return <Users className="w-3 h-3" />;
      case 'liquidity-risk':
        return <Activity className="w-3 h-3" />;
      case 'whale-activity':
        return signal.risk > 50 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  const getSignalColor = (signal: HolderSignal) => {
    if (signal.risk > 70) return 'text-red-400';
    if (signal.risk > 40) return 'text-yellow-400';
    if (signal.risk < 30) return 'text-green-400';
    return 'text-gray-400';
  };

  const highRiskSignals = data.signals.filter((s: HolderSignal) => s.risk > 60);
  const mediumRiskSignals = data.signals.filter((s: HolderSignal) => s.risk > 30 && s.risk <= 60);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Holder Analysis</h3>
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
        {/* Concentration Risk */}
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Top 10</div>
          <div className={`text-lg font-semibold ${getConcentrationColor(data.concentration.riskLevel)}`}>
            {data.concentration.top10Percentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">{data.concentration.riskLevel}</div>
        </div>

        {/* Total Holders */}
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Holders</div>
          <div className={`text-lg font-semibold ${getDistributionColor(data.distribution.distributionPattern)}`}>
            {data.distribution.holders.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">{data.distribution.distributionPattern}</div>
        </div>

        {/* Whale Activity */}
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Whales</div>
          <div className="text-lg font-semibold text-gray-300">
            {data.whaleHolders.whaleCount}
          </div>
          <div className="text-xs text-gray-500">
            {data.whaleHolders.whalePercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Risk Signals */}
      {highRiskSignals.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <div className="text-xs text-red-400 mb-2">⚠️ High Risk Signals</div>
          <div className="space-y-2">
            {highRiskSignals.map((signal: HolderSignal, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`flex-shrink-0 mt-0.5 ${getSignalColor(signal)}`}>
                  {getSignalIcon(signal)}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-medium ${getSignalColor(signal)}`}>
                    {signal.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Risk: {signal.risk}% | Confidence: {signal.confidence}%
                  </div>
                  <div className="text-xs mt-1 text-gray-400">
                    {signal.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Risk Signals */}
      {mediumRiskSignals.length > 0 && !showDetails && (
        <div className="border-t border-gray-700 pt-3">
          <div className="text-xs text-yellow-400 mb-2">⚠️ Medium Risk Signals</div>
          <div className="space-y-2">
            {mediumRiskSignals.slice(0, 2).map((signal: HolderSignal, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`flex-shrink-0 mt-0.5 ${getSignalColor(signal)}`}>
                  {getSignalIcon(signal)}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-medium ${getSignalColor(signal)}`}>
                    {signal.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Risk: {signal.risk}% | Confidence: {signal.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Details View */}
      {showDetails && (
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="space-y-3">
            {/* Concentration Summary */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Concentration Analysis</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Top 10:</span>
                  <span className={`ml-2 font-medium ${getConcentrationColor(data.concentration.riskLevel)}`}>
                    {data.concentration.top10Percentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Top 50:</span>
                  <span className="ml-2 text-gray-300">
                    {data.concentration.top50Percentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Top 100:</span>
                  <span className="ml-2 text-gray-300">
                    {data.concentration.top100Percentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Risk Score:</span>
                  <span className="ml-2 text-gray-300">{data.riskScore.toFixed(0)}/100</span>
                </div>
              </div>
            </div>

            {/* Distribution Summary */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Distribution Health</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Total Holders:</span>
                  <span className="ml-2 text-gray-300">
                    {data.distribution.holders.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Avg Holding:</span>
                  <span className="ml-2 text-gray-300">
                    ${data.distribution.averageHolding.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">24h Growth:</span>
                  <span className={`ml-2 ${data.holder.holderGrowth24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.holder.holderGrowth24h > 0 ? '+' : ''}{data.holder.holderGrowth24h}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Pattern:</span>
                  <span className={`ml-2 ${getDistributionColor(data.distribution.distributionPattern)}`}>
                    {data.distribution.distributionPattern}
                  </span>
                </div>
              </div>
            </div>

            {/* Whale Activity Summary */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Whale Activity</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Whale Count:</span>
                  <span className="ml-2 text-gray-300">
                    {data.whaleHolders.whaleCount}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Whale %:</span>
                  <span className="ml-2 text-gray-300">
                    {data.whaleHolders.whalePercentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Activity:</span>
                  <span className={`ml-2 ${data.whaleHolders.recentActivity ? 'text-yellow-400' : 'text-green-400'}`}>
                    {data.whaleHolders.recentActivity ? 'Active' : 'Quiet'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Trend:</span>
                  <span className={`ml-2 ${
                    data.whaleHolders.accumulating ? 'text-green-400' : 
                    data.whaleHolders.distributing ? 'text-red-400' : 
                    'text-gray-300'
                  }`}>
                    {data.whaleHolders.accumulating ? 'Accumulating' : 
                     data.whaleHolders.distributing ? 'Distributing' : 
                     'Stable'}
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