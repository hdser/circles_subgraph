import { createContext, useContext, useState, ReactNode } from 'react';
import { SearchState, SearchType } from '../utils/types';

interface SearchContextType {
  searchState: SearchState;
  setSearchType: (type: SearchType) => void;
  setSearchValue: (value: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  resetSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const initialSearchState: SearchState = {
  type: 'transaction',
  value: '',
  isSearching: false,
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchState, setSearchState] = useState<SearchState>(initialSearchState);

  const setSearchType = (type: SearchType) => {
    setSearchState(prev => ({ ...prev, type }));
  };

  const setSearchValue = (value: string) => {
    setSearchState(prev => ({ ...prev, value }));
  };

  const setIsSearching = (isSearching: boolean) => {
    setSearchState(prev => ({ ...prev, isSearching }));
  };

  const resetSearch = () => {
    setSearchState(initialSearchState);
  };

  return (
    <SearchContext.Provider
      value={{
        searchState,
        setSearchType,
        setSearchValue,
        setIsSearching,
        resetSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}