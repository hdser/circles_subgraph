import { Hash, User } from 'lucide-react';
import clsx from 'clsx';
import { SearchType } from '../../utils/types';

interface SearchTypeToggleProps {
  value: SearchType;
  onChange: (type: SearchType) => void;
}

export default function SearchTypeToggle({ value, onChange }: SearchTypeToggleProps) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1">
      <button
        type="button"
        onClick={() => onChange('transaction')}
        className={clsx(
          'flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors duration-200',
          value === 'transaction'
            ? 'bg-white text-circles-purple shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        <Hash className="h-4 w-4" />
        <span className="text-sm font-medium">Transaction</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('address')}
        className={clsx(
          'flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors duration-200',
          value === 'address'
            ? 'bg-white text-circles-purple shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">Address</span>
      </button>
    </div>
  );
}