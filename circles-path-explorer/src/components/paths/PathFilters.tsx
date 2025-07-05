import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { PathFilters as PathFiltersType } from '../../utils/types';
import clsx from 'clsx';

interface PathFiltersProps {
  filters: PathFiltersType;
  onFiltersChange: (filters: PathFiltersType) => void;
}

export default function PathFilters({ filters, onFiltersChange }: PathFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleCircular = () => {
    onFiltersChange({
      ...filters,
      circularOnly: !filters.circularOnly,
    });
  };

  const handleMinHopsChange = (value: string) => {
    const num = parseInt(value) || undefined;
    onFiltersChange({
      ...filters,
      minHops: num,
    });
  };

  const handleMaxHopsChange = (value: string) => {
    const num = parseInt(value) || undefined;
    onFiltersChange({
      ...filters,
      maxHops: num,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.circularOnly || filters.minHops || filters.maxHops;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors',
          hasActiveFilters
            ? 'border-circles-purple bg-circles-light text-circles-purple'
            : 'border-gray-300 hover:bg-gray-50'
        )}
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
        {hasActiveFilters && (
          <span className="bg-circles-purple text-white text-xs px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Filter Paths</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Circular Only */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.circularOnly || false}
                      onChange={handleToggleCircular}
                      className="rounded border-gray-300 text-circles-purple focus:ring-circles-purple"
                    />
                    <span className="text-sm text-gray-700">Circular transfers only</span>
                  </label>
                </div>

                {/* Hop Count Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Hops
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Min"
                      value={filters.minHops || ''}
                      onChange={(e) => handleMinHopsChange(e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-circles-purple"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Max"
                      value={filters.maxHops || ''}
                      onChange={(e) => handleMaxHopsChange(e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-circles-purple"
                    />
                  </div>
                </div>

                {/* Date Range - Future Enhancement */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <p className="text-xs text-gray-500">Coming soon</p>
                </div> */}
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}