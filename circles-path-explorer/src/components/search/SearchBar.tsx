import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchTypeToggle from './SearchTypeToggle';
import { SearchType } from '../../utils/types';
import { detectSearchType, isValidInput } from '../../utils/helpers';

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<SearchType>('transaction');
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) {
      toast.error('Please enter a value to search');
      return;
    }

    // Auto-detect type if possible
    const detectedType = detectSearchType(trimmedValue);
    const actualType = detectedType || searchType;

    if (!isValidInput(trimmedValue, actualType)) {
      toast.error(`Invalid ${actualType} format`);
      return;
    }

    // Navigate to appropriate route
    if (actualType === 'transaction') {
      navigate(`/tx/${trimmedValue}`);
    } else {
      navigate(`/address/${trimmedValue}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <SearchTypeToggle value={searchType} onChange={setSearchType} />
        
        <div className="mt-4 relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={
              searchType === 'transaction' 
                ? 'Enter transaction hash (0x...)' 
                : 'Enter address (0x...)'
            }
            className="input-primary pr-12"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {searchType === 'transaction' 
            ? 'View all transfer paths within a transaction'
            : 'Explore all transfer paths for an address'
          }
        </p>
      </div>
    </form>
  );
}