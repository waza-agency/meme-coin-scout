import React, { useState, useEffect } from 'react';
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
  // Local state for input values (with formatting)
  const [localValues, setLocalValues] = useState({
    minMarketCap: filters.minMarketCap.toLocaleString(),
    maxMarketCap: filters.maxMarketCap.toLocaleString(),
    minAge: filters.minAge.toString(),
    maxAge: filters.maxAge.toString(),
    minLiquidity: filters.minLiquidity.toLocaleString(),
    maxLiquidity: filters.maxLiquidity.toLocaleString(),
  });

  // Track if field is focused
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Update local values when filters change from outside (e.g., presets)
  useEffect(() => {
    setLocalValues({
      minMarketCap: filters.minMarketCap.toLocaleString(),
      maxMarketCap: filters.maxMarketCap.toLocaleString(),
      minAge: filters.minAge.toString(),
      maxAge: filters.maxAge.toString(),
      minLiquidity: filters.minLiquidity.toLocaleString(),
      maxLiquidity: filters.maxLiquidity.toLocaleString(),
    });
  }, [filters]);

  const handleInputChange = (field: keyof FilterCriteria, value: string) => {
    // Remove all non-numeric characters except commas
    const cleanValue = value.replace(/[^0-9,]/g, '');
    
    // Update local state immediately for responsive typing
    setLocalValues(prev => ({
      ...prev,
      [field]: cleanValue
    }));
  };

  const handleInputFocus = (field: string, e: React.FocusEvent<HTMLInputElement>) => {
    setFocusedField(field);
    // Select all text when focusing
    e.target.select();
  };

  const handleInputBlur = (field: keyof FilterCriteria) => {
    setFocusedField(null);
    
    // Parse the value when user leaves the field
    const value = localValues[field];
    const numValue = parseInt(value.replace(/,/g, '')) || 0;
    
    // Basic validation for range fields
    let validatedValue = numValue;
    
    if (field === 'minMarketCap' && validatedValue < 0) validatedValue = 0;
    if (field === 'maxMarketCap' && validatedValue < 1000) validatedValue = 1000;
    if (field === 'minAge' && validatedValue < 0) validatedValue = 0;
    if (field === 'maxAge' && validatedValue < 1) validatedValue = 1;
    if (field === 'minLiquidity' && validatedValue < 0) validatedValue = 0;
    if (field === 'maxLiquidity' && validatedValue < 1000) validatedValue = 1000;
    
    const newFilters = {
      ...filters,
      [field]: validatedValue
    };
    
    // Ensure min values are not greater than max values
    if (field === 'minMarketCap' && validatedValue > filters.maxMarketCap) {
      newFilters.maxMarketCap = validatedValue;
    }
    if (field === 'maxMarketCap' && validatedValue < filters.minMarketCap) {
      newFilters.minMarketCap = validatedValue;
    }
    if (field === 'minAge' && validatedValue > filters.maxAge) {
      newFilters.maxAge = validatedValue;
    }
    if (field === 'maxAge' && validatedValue < filters.minAge) {
      newFilters.minAge = validatedValue;
    }
    if (field === 'minLiquidity' && validatedValue > filters.maxLiquidity) {
      newFilters.maxLiquidity = validatedValue;
    }
    if (field === 'maxLiquidity' && validatedValue < filters.minLiquidity) {
      newFilters.minLiquidity = validatedValue;
    }
    
    // Update the formatted value in local state
    if (field === 'minAge' || field === 'maxAge') {
      setLocalValues(prev => ({
        ...prev,
        [field]: validatedValue.toString()
      }));
    } else {
      setLocalValues(prev => ({
        ...prev,
        [field]: validatedValue.toLocaleString()
      }));
    }
    
    onFilterChange(newFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: keyof FilterCriteria) => {
    if (e.key === 'Enter') {
      handleInputBlur(field);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof FilterCriteria) => {
    // When user presses backspace or delete on selected text, clear the field
    if ((e.key === 'Backspace' || e.key === 'Delete') && e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === e.currentTarget.value.length) {
      e.preventDefault();
      setLocalValues(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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
                  value={localValues.minMarketCap}
                  onChange={(e) => handleInputChange('minMarketCap', e.target.value)}
                  onFocus={(e) => handleInputFocus('minMarketCap', e)}
                  onBlur={() => handleInputBlur('minMarketCap')}
                  onKeyPress={(e) => handleKeyPress(e, 'minMarketCap')}
                  onKeyDown={(e) => handleKeyDown(e, 'minMarketCap')}
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
                  value={localValues.maxMarketCap}
                  onChange={(e) => handleInputChange('maxMarketCap', e.target.value)}
                  onFocus={(e) => handleInputFocus('maxMarketCap', e)}
                  onBlur={() => handleInputBlur('maxMarketCap')}
                  onKeyPress={(e) => handleKeyPress(e, 'maxMarketCap')}
                  onKeyDown={(e) => handleKeyDown(e, 'maxMarketCap')}
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
                type="text"
                value={localValues.minAge}
                onChange={(e) => handleInputChange('minAge', e.target.value)}
                onFocus={(e) => handleInputFocus('minAge', e)}
                onBlur={() => handleInputBlur('minAge')}
                onKeyPress={(e) => handleKeyPress(e, 'minAge')}
                onKeyDown={(e) => handleKeyDown(e, 'minAge')}
                disabled={disabled}
                className="input-field w-full"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Maximum</label>
              <input
                type="text"
                value={localValues.maxAge}
                onChange={(e) => handleInputChange('maxAge', e.target.value)}
                onFocus={(e) => handleInputFocus('maxAge', e)}
                onBlur={() => handleInputBlur('maxAge')}
                onKeyPress={(e) => handleKeyPress(e, 'maxAge')}
                onKeyDown={(e) => handleKeyDown(e, 'maxAge')}
                disabled={disabled}
                className="input-field w-full"
                placeholder="30"
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
                  value={localValues.minLiquidity}
                  onChange={(e) => handleInputChange('minLiquidity', e.target.value)}
                  onFocus={(e) => handleInputFocus('minLiquidity', e)}
                  onBlur={() => handleInputBlur('minLiquidity')}
                  onKeyPress={(e) => handleKeyPress(e, 'minLiquidity')}
                  onKeyDown={(e) => handleKeyDown(e, 'minLiquidity')}
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
                  value={localValues.maxLiquidity}
                  onChange={(e) => handleInputChange('maxLiquidity', e.target.value)}
                  onFocus={(e) => handleInputFocus('maxLiquidity', e)}
                  onBlur={() => handleInputBlur('maxLiquidity')}
                  onKeyPress={(e) => handleKeyPress(e, 'maxLiquidity')}
                  onKeyDown={(e) => handleKeyDown(e, 'maxLiquidity')}
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
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Quick Presets</h4>
          <button
            onClick={() => onFilterChange({ minMarketCap: 1000, maxMarketCap: 10000000, minAge: 0, maxAge: 30, minLiquidity: 1000, maxLiquidity: 5000000 })}
            disabled={disabled}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
            title="Reset all filters to default values"
          >
            Reset All
          </button>
        </div>
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
          <button
            onClick={() => onFilterChange({ minMarketCap: 10000, maxMarketCap: 500000, minAge: 0, maxAge: 14, minLiquidity: 5000, maxLiquidity: 100000 })}
            disabled={disabled}
            className="px-3 py-1 bg-crypto-light-gray text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Micro Caps
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;