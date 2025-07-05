import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i;
    if (currentPage < 3) return i;
    if (currentPage >= totalPages - 3) return totalPages - 5 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {currentPage > 2 && totalPages > 5 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className="px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            1
          </button>
          <span className="text-gray-400">...</span>
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={clsx(
            'px-3 py-1 rounded-lg transition-colors',
            currentPage === page
              ? 'bg-circles-purple text-white'
              : 'hover:bg-gray-100'
          )}
        >
          {page + 1}
        </button>
      ))}

      {currentPage < totalPages - 3 && totalPages > 5 && (
        <>
          <span className="text-gray-400">...</span>
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className="px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}