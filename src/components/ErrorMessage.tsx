import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-crypto-red/10 border border-crypto-red/20 rounded-lg p-6 text-center">
      <AlertCircle className="w-12 h-12 text-crypto-red mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 