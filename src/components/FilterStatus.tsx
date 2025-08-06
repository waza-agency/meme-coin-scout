import React from 'react';
import { Filter, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { FilterCriteria } from '../types';

interface FilterStatusProps {
  totalCoins: number;
  filteredCoins: number;
  filters: FilterCriteria;
}

const FilterStatus: React.FC<FilterStatusProps> = ({ 
  totalCoins, 
  filteredCoins, 
  filters 
}) => {
  const filterCount = filteredCoins;
  const filteredOutCount = totalCoins - filteredCoins;
  const filterPercentage = totalCoins > 0 ? ((filteredCoins / totalCoins) * 100).toFixed(1) : '0';

  if (totalCoins === 0) return null;

  return (
    <div className="bg-crypto-gray rounded-lg p-4 border border-gray-700 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-crypto-accent" />
        <h3 className="text-sm font-semibold text-white">Filter Results</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-crypto-accent">{filterCount}</div>
          <div className="text-gray-400">Matching Coins</div>
          <div className="text-xs text-gray-500">{filterPercentage}% of total</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{filteredOutCount}</div>
          <div className="text-gray-400">Filtered Out</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-gray-300">{totalCoins}</div>
          <div className="text-gray-400">Total Found</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">
            {((filteredOutCount / totalCoins) * 100).toFixed(0)}%
          </div>
          <div className="text-gray-400">Filtered</div>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Active Filters:</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded">
            <DollarSign className="w-3 h-3" />
            <span>MC: ${filters.minMarketCap.toLocaleString()} - ${filters.maxMarketCap.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded">
            <Clock className="w-3 h-3" />
            <span>Age: {filters.minAge} - {filters.maxAge} days</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded">
            <TrendingUp className="w-3 h-3" />
            <span>Liq: ${filters.minLiquidity.toLocaleString()} - ${filters.maxLiquidity.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterStatus;