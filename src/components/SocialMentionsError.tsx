import React from 'react';
import { AlertCircle, CreditCard, Key, Clock, Wifi, WifiOff, Server } from 'lucide-react';

interface SocialMentionsErrorProps {
  error?: string;
}

const SocialMentionsError: React.FC<SocialMentionsErrorProps> = ({ error }) => {
  // Determine error type and appropriate message
  const getErrorDisplay = () => {
    if (!error) {
      return {
        icon: <AlertCircle className="w-3 h-3" />,
        title: 'No Data',
        message: 'Social mentions unavailable',
        color: 'text-gray-500',
        action: null
      };
    }

    if (error.includes('INSUFFICIENT_CREDITS')) {
      return {
        icon: <CreditCard className="w-3 h-3" />,
        title: 'No Credits',
        message: 'API credits exhausted',
        color: 'text-orange-500',
        action: (
          <a 
            href="https://console.x.ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-crypto-accent hover:text-crypto-accent/80 text-xs underline ml-1"
            title="Add API credits"
          >
            Fix →
          </a>
        )
      };
    }

    if (error.includes('INVALID_TWITTER_TOKEN') || error.includes('INVALID_API_KEY')) {
      return {
        icon: <Key className="w-3 h-3" />,
        title: 'Invalid Token',
        message: 'Twitter API token invalid',
        color: 'text-red-500',
        action: (
          <a 
            href="https://developer.twitter.com/en/portal/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-crypto-accent hover:text-crypto-accent/80 text-xs underline ml-1"
            title="Get new Twitter API token"
          >
            Fix →
          </a>
        )
      };
    }

    if (error.includes('TWITTER_RATE_LIMIT') || error.includes('RATE_LIMIT') || error.includes('429')) {
      return {
        icon: <Clock className="w-3 h-3" />,
        title: 'Rate Limited',
        message: 'Wait 15 minutes',
        color: 'text-yellow-500',
        action: null
      };
    }

    if (error.includes('PROXY_NOT_RUNNING') || error.includes('ECONNREFUSED')) {
      return {
        icon: <Server className="w-3 h-3" />,
        title: 'Proxy Down',
        message: 'Backend proxy not running',
        color: 'text-red-500',
        action: (
          <span className="text-xs text-gray-400 ml-1" title="Run: npm run server">
            Start proxy
          </span>
        )
      };
    }

    if (error.includes('NETWORK_ERROR') || error.includes('ENOTFOUND')) {
      return {
        icon: <WifiOff className="w-3 h-3" />,
        title: 'Network Error',
        message: 'Connection failed',
        color: 'text-red-500',
        action: null
      };
    }

    if (error.includes('TWITTER_FORBIDDEN') || error.includes('403')) {
      return {
        icon: <Key className="w-3 h-3" />,
        title: 'Access Denied',
        message: 'Check token permissions',
        color: 'text-red-500',
        action: null
      };
    }

    // Generic error
    return {
      icon: <AlertCircle className="w-3 h-3" />,
      title: 'API Error',
      message: 'Social data unavailable',
      color: 'text-yellow-500',
      action: null
    };
  };

  const { icon, title, message, color, action } = getErrorDisplay();

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-sm">Social Mentions</span>
      <div className="flex items-center gap-1">
        <div className={`flex items-center gap-1 ${color}`}>
          {icon}
          <span className="text-xs font-medium">{title}</span>
        </div>
        {action}
      </div>
    </div>
  );
};

export default SocialMentionsError;