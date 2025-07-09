import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-crypto-accent mx-auto mb-4" />
        <p className="text-gray-400">Searching for meme coins...</p>
        <p className="text-gray-500 text-sm mt-2">
          This may take a moment as we scan multiple quote tokens
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 