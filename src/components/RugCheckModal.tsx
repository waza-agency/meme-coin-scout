import React from 'react';
import { X, Shield, ShieldAlert, ShieldX, Lock, Users, Droplets, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { RugCheckRiskData } from '../services/rugcheck';

interface RugCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  rugCheckData: RugCheckRiskData;
  tokenSymbol: string;
}

const RugCheckModal: React.FC<RugCheckModalProps> = ({
  isOpen,
  onClose,
  rugCheckData,
  tokenSymbol
}) => {
  if (!isOpen) return null;

  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'low':
        return {
          icon: <Shield className="w-6 h-6 text-green-400" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10 border-green-500/20',
          label: 'Low Risk'
        };
      case 'medium':
        return {
          icon: <ShieldAlert className="w-6 h-6 text-yellow-400" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10 border-yellow-500/20',
          label: 'Medium Risk'
        };
      case 'high':
        return {
          icon: <ShieldX className="w-6 h-6 text-red-400" />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10 border-red-500/20',
          label: 'High Risk'
        };
      default:
        return {
          icon: <Shield className="w-6 h-6 text-gray-400" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10 border-gray-500/20',
          label: 'Unknown Risk'
        };
    }
  };

  const riskInfo = getRiskLevelInfo(rugCheckData.riskLevel);

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getRiskItemIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'danger':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRiskItemColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-300';
      case 'warn':
        return 'text-yellow-300';
      case 'danger':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {riskInfo.icon}
            <div>
              <h2 className="text-xl font-bold text-white">Risk Analysis</h2>
              <p className="text-gray-400">{tokenSymbol} Security Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Risk Score Section */}
        <div className="p-6">
          <div className={`p-4 rounded-lg border ${riskInfo.bgColor} mb-6`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-white">Overall Risk Score</span>
              <span className={`text-2xl font-bold ${riskInfo.color}`}>
                {rugCheckData.riskScore}/100
              </span>
            </div>
            <div className="flex items-center gap-2">
              {riskInfo.icon}
              <span className={`font-medium ${riskInfo.color}`}>{riskInfo.label}</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Holders */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Holders</span>
              </div>
              <span className="text-lg font-bold text-white">
                {rugCheckData.holders.toLocaleString()}
              </span>
            </div>

            {/* Liquidity */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Liquidity</span>
              </div>
              <span className="text-lg font-bold text-white">
                {formatNumber(rugCheckData.liquidity)}
              </span>
            </div>

            {/* LP Locked */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">LP Locked</span>
              </div>
              <div className="flex items-center gap-2">
                {rugCheckData.lpLocked ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-lg font-bold text-white">
                  {rugCheckData.lpLocked ? formatPercentage(rugCheckData.lpLockedPct) : 'No'}
                </span>
              </div>
            </div>

            {/* Top Holders */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Top 10 Holders</span>
              </div>
              <span className="text-lg font-bold text-white">
                {formatPercentage(rugCheckData.topHoldersPct)}
              </span>
            </div>

            {/* Mint Authority */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Mint Authority</span>
              </div>
              <div className="flex items-center gap-2">
                {rugCheckData.mintAuthority ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                <span className="text-lg font-bold text-white">
                  {rugCheckData.mintAuthority ? 'Active' : 'Renounced'}
                </span>
              </div>
            </div>

            {/* Freeze Authority */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Freeze Authority</span>
              </div>
              <div className="flex items-center gap-2">
                {rugCheckData.freezeAuthority ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                <span className="text-lg font-bold text-white">
                  {rugCheckData.freezeAuthority ? 'Active' : 'Renounced'}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Details */}
          {rugCheckData.risks && rugCheckData.risks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Risk Details</h3>
              <div className="space-y-3">
                {rugCheckData.risks.map((risk, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      {getRiskItemIcon(risk.level)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-white">{risk.name}</h4>
                          <span className={`text-sm font-medium ${getRiskItemColor(risk.level)}`}>
                            Score: {risk.score}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{risk.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Risks Message */}
          {(!rugCheckData.risks || rugCheckData.risks.length === 0) && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-medium">No specific risks detected</p>
              <p className="text-green-400/80 text-sm">This token appears to have a clean security profile</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          <p className="text-xs text-gray-500 text-center">
            Risk analysis powered by RugCheck.xyz • Data may not be real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default RugCheckModal; 