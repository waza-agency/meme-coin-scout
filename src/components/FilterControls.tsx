import React from 'react';
import { FilterCriteria } from '../types';

interface FilterControlsProps {
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  disabled?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  disabled = false
}) => {
  const handleChange = (field: keyof FilterCriteria, value: string) => {
    // Remove commas and dollar signs, then convert to number
    const cleanValue = value.replace(/[$,]/g, '');
    const numValue = parseInt(cleanValue) || 0;
    onFilterChange({
      ...filters,
      [field]: numValue
    });
  };

  // Format number with commas for display
  const formatDisplayValue = (value: number): string => {
    return value.toLocaleString();
  };

  return (
    <div className="bg-crypto-gray rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Filter Criteria</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Market Cap Range */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Market Cap Range (USD)</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Minimum</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  value={formatDisplayValue(filters.minMarketCap)}
                  onChange={(e) => handleChange('minMarketCap', e.target.value)}
                  disabled={disabled}
                  className="input-field w-full pl-6"
                  placeholder="1,000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Maximum</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  value={formatDisplayValue(filters.maxMarketCap)}
                  onChange={(e) => handleChange('maxMarketCap', e.target.value)}
                  disabled={disabled}
                  className="input-field w-full pl-6"
                  placeholder="10,000,000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Age Range (Days)</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Minimum</label>
              <input
                type="number"
                value={filters.minAge}
                onChange={(e) => handleChange('minAge', e.target.value)}
                disabled={disabled}
                className="input-field w-full"
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Maximum</label>
              <input
                type="number"
                value={filters.maxAge}
                onChange={(e) => handleChange('maxAge', e.target.value)}
                disabled={disabled}
                className="input-field w-full"
                placeholder="30"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Liquidity Range */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Liquidity Range (USD)</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Minimum</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  value={formatDisplayValue(filters.minLiquidity)}
                  onChange={(e) => handleChange('minLiquidity', e.target.value)}
                  disabled={disabled}
                  className="input-field w-full pl-6"
                  placeholder="1,000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Maximum</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  value={formatDisplayValue(filters.maxLiquidity)}
                  onChange={(e) => handleChange('maxLiquidity', e.target.value)}
                  disabled={disabled}
                  className="input-field w-full pl-6"
                  placeholder="5,000,000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Presets</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange({ minMarketCap: 1000, maxMarketCap: 100000, minAge: 0, maxAge: 3, minLiquidity: 1000, maxLiquidity: 50000 })}
            disabled={disabled}
            className="px-3 py-1 bg-crypto-light-gray text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
          >
            New Launches
          </button>
          <button
            onClick={() => onFilterChange({ minMarketCap: 100000, maxMarketCap: 1000000, minAge: 1, maxAge: 7, minLiquidity: 10000, maxLiquidity: 500000 })}
            disabled={disabled}
            className="px-3 py-1 bg-crypto-light-gray text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Early Stage
          </button>
          <button
            onClick={() => onFilterChange({ minMarketCap: 1000000, maxMarketCap: 10000000, minAge: 3, maxAge: 30, minLiquidity: 50000, maxLiquidity: 5000000 })}
            disabled={disabled}
            className="px-3 py-1 bg-crypto-light-gray text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Established
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls; 