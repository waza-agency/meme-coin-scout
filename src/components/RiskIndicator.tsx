import React from 'react';
import { Shield, ShieldAlert, ShieldX } from 'lucide-react';
import { RiskIndicator as RiskIndicatorType } from '../utils/indicators';

interface RiskIndicatorProps {
  indicator: RiskIndicatorType;
  showScore?: boolean;
  onClick?: () => void;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ 
  indicator, 
  showScore = true,
  onClick
}) => {
  const getBgColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500/20 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'high':
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getIcon = (level: string) => {
    const iconClass = `w-3 h-3 ${indicator.color}`;
    switch (level) {
      case 'low':
        return <Shield className={iconClass} />;
      case 'medium':
        return <ShieldAlert className={iconClass} />;
      case 'high':
        return <ShieldX className={iconClass} />;
      default:
        return <Shield className={iconClass} />;
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 px-2 py-1 rounded-md border ${getBgColor(indicator.level)} ${
        onClick ? 'cursor-pointer hover:bg-opacity-80 transition-all' : ''
      }`}
      onClick={onClick ? (e) => {
        e.stopPropagation();
        onClick();
      } : undefined}
      title={onClick ? 'Click to view detailed risk analysis' : undefined}
    >
      {getIcon(indicator.level)}
      <span className={`text-xs font-medium ${indicator.color}`}>
        {indicator.label}
      </span>
      {showScore && (
        <span className="text-xs text-gray-300">
          {indicator.score}/100
        </span>
      )}
    </div>
  );
};

export default RiskIndicator; 