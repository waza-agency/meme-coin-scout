import { ViewMode } from '../types';
import { Grid3X3, List, LayoutGrid } from 'lucide-react';

interface ViewSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ viewMode, onViewModeChange }) => {
  const viewOptions = [
    {
      mode: 'compact' as ViewMode,
      label: 'Compact',
      icon: List,
      description: 'Essential info only'
    },
    {
      mode: 'medium' as ViewMode,
      label: 'Medium',
      icon: LayoutGrid,
      description: 'Key details'
    },
    {
      mode: 'detailed' as ViewMode,
      label: 'Detailed',
      icon: Grid3X3,
      description: 'Full analysis'
    }
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <span className="text-gray-400 text-sm font-medium">View Mode:</span>
      <div className="flex gap-2">
        {viewOptions.map(({ mode, label, icon: Icon, description }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              viewMode === mode
                ? 'bg-crypto-accent text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
            title={description}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ViewSelector;