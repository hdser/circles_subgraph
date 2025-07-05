import { createContext, useContext, useState, ReactNode } from 'react';
import { PathFilters } from '../utils/types';

interface FilterContextType {
  filters: PathFilters;
  setFilters: (filters: PathFilters) => void;
  applyFilters: <T extends { isCircular: boolean; totalHops: number }>(
    items: T[]
  ) => T[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<PathFilters>({});

  const applyFilters = <T extends { isCircular: boolean; totalHops: number }>(
    items: T[]
  ): T[] => {
    return items.filter(item => {
      if (filters.circularOnly && !item.isCircular) {
        return false;
      }
      
      if (filters.minHops && item.totalHops < filters.minHops) {
        return false;
      }
      
      if (filters.maxHops && item.totalHops > filters.maxHops) {
        return false;
      }
      
      return true;
    });
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, applyFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}