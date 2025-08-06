import React, { useState } from 'react';
import { HelpCircle, ExternalLink, Terminal, Check, X } from 'lucide-react';

const SocialMentionsSetupHelper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
        title="Setup help for social mentions"
      >
        <HelpCircle className="w-3 h-3" />
        Setup Help
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Social Mentions Setup</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-300">Prerequisites:</h4>
              <div className="space-y-1 text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>Twitter Developer Account</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>Twitter Bearer Token</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>Backend Proxy Running</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-300">Setup Steps:</h4>
              <div className="space-y-2 text-gray-400">
                <div>
                  <strong>1. Get Twitter API Access:</strong>
                  <a
                    href="https://developer.twitter.com/en/portal/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-crypto-accent hover:text-crypto-accent/80 inline-flex items-center gap-1 ml-1"
                  >
                    Twitter Developer Portal
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                <div>
                  <strong>2. Add Token to .env.local:</strong>
                  <div className="bg-gray-900 p-2 rounded mt-1 font-mono text-xs">
                    VITE_TWITTER_BEARER_TOKEN=your_token_here
                  </div>
                </div>
                
                <div>
                  <strong>3. Start Backend Proxy:</strong>
                  <div className="bg-gray-900 p-2 rounded mt-1 font-mono text-xs flex items-center gap-1">
                    <Terminal className="w-3 h-3" />
                    npm run server
                  </div>
                </div>
                
                <div>
                  <strong>4. Test Setup:</strong>
                  <div className="bg-gray-900 p-2 rounded mt-1 text-xs">
                    Open browser console and run: <code className="text-crypto-accent">debugSocialMentions()</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-300">Common Issues:</h4>
              <div className="space-y-1 text-gray-400">
                <div>• <strong>401 Unauthorized:</strong> Invalid or expired token</div>
                <div>• <strong>403 Forbidden:</strong> App suspended or no permissions</div>
                <div>• <strong>429 Rate Limited:</strong> Too many requests (15/15min limit)</div>
                <div>• <strong>Proxy Error:</strong> Backend not running</div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Quick test:</span>
                <button
                  onClick={() => {
                    const debugSocialMentions = (window as any).debugSocialMentions;
                    if (debugSocialMentions) {
                      debugSocialMentions();
                      console.log('🔍 Running social mentions diagnostic...');
                    } else {
                      console.error('Debug function not available');
                    }
                  }}
                  className="px-2 py-1 bg-crypto-accent hover:bg-crypto-accent-hover text-white rounded text-xs"
                >
                  Run Diagnostic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMentionsSetupHelper;