import React from 'react';
import { Search } from 'lucide-react';
import { FilterCriteria } from '../types';
import { formatMarketCap } from '../utils/filters';

interface NoResultsProps {
  filters: FilterCriteria;
  blockchain: string;
}

const NoResults: React.FC<NoResultsProps> = ({ filters, blockchain }) => {
  return (
    <div className="bg-crypto-gray/50 border border-gray-700 rounded-lg p-8 text-center">
      <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        No coins found matching your criteria
      </h3>
      <p className="text-gray-400 mb-4">
        Try adjusting your filters to find more results
      </p>
      
      <div className="bg-crypto-light-gray rounded-lg p-4 max-w-md mx-auto">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Current Filters:</h4>
        <div className="text-sm text-gray-400 space-y-1">
          <div>
            <strong>Blockchain:</strong> {blockchain}
          </div>
          <div>
            <strong>Market Cap:</strong> {formatMarketCap(filters.minMarketCap)} - {formatMarketCap(filters.maxMarketCap)}
          </div>
          <div>
            <strong>Age:</strong> {filters.minAge} - {filters.maxAge} days
          </div>
          <div>
            <strong>Liquidity:</strong> {formatMarketCap(filters.minLiquidity)} - {formatMarketCap(filters.maxLiquidity)}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Tips for better results:</p>
        <ul className="mt-2 space-y-1">
          <li>• Try widening your market cap range</li>
          <li>• Increase the maximum age limit</li>
          <li>• Switch to a different blockchain</li>
        </ul>
      </div>
    </div>
  );
};

export default NoResults; 