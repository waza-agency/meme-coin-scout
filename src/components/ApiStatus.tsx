import React from 'react';
import { AlertCircle, Settings, ExternalLink } from 'lucide-react';
import SocialMentionsSetupHelper from './SocialMentionsSetupHelper';

interface ApiStatusProps {
  errors: {
    xai?: boolean;
    twitter?: boolean;
    rugcheck?: boolean;
    solanaTracker?: boolean;
  };
}

const ApiStatus: React.FC<ApiStatusProps> = ({ errors }) => {
  const hasErrors = Object.values(errors).some(error => error);
  
  if (!hasErrors) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-red-900/90 border border-red-700 rounded-lg p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium">API Issues Detected</h3>
            <SocialMentionsSetupHelper />
          </div>
          
          <div className="space-y-1 text-sm">
            {errors.twitter && (
              <div className="text-red-300">
                • <strong>Twitter API:</strong> Authentication or proxy issues
              </div>
            )}
            {errors.xai && (
              <div className="text-red-300">
                • <strong>Xai API (403):</strong> Access forbidden - check API key at{' '}
                <a 
                  href="https://console.x.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:text-red-200 inline-flex items-center gap-1"
                >
                  console.x.ai
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {errors.rugcheck && (
              <div className="text-red-300">
                • <strong>RugCheck:</strong> Rate limited - too many requests
              </div>
            )}
            {errors.solanaTracker && (
              <div className="text-red-300">
                • <strong>Solana Tracker:</strong> API key required
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-red-800">
            <div className="flex items-center justify-between">
              <p className="text-red-200 text-xs">
                Social mentions data unavailable
              </p>
              <button
                onClick={() => {
                  const debugSocialMentions = (window as any).debugSocialMentions;
                  if (debugSocialMentions) {
                    debugSocialMentions();
                    console.log('🔍 Running diagnostic - check console for results');
                  } else {
                    console.error('Debug function not available');
                  }
                }}
                className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded transition-colors flex items-center gap-1"
                title="Run diagnostic in console"
              >
                <Settings className="w-3 h-3" />
                Diagnose
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;