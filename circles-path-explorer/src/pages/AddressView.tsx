import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePathsByAddress } from '../hooks/usePathsByAddress';
import { useFilters } from '../contexts/FilterContext';
import PathTable from '../components/paths/PathTable';
import PathFilters from '../components/paths/PathFilters';
import PathStats from '../components/paths/PathStats';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function AddressView() {
  const { address } = useParams<{ address: string }>();
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const { paths, loading, error, pagination } = usePathsByAddress(address || '');
  const { filters, setFilters, applyFilters } = useFilters();

  const filteredPaths = useMemo(() => {
    return applyFilters(paths);
  }, [paths, applyFilters]);

  const handleSelectPath = (pathId: string) => {
    // Toggle selection: if the same path is clicked, deselect it. Otherwise, select the new one.
    setSelectedPathId(prevId => (prevId === pathId ? null : pathId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to search
        </Link>
        <ErrorMessage 
          title="Failed to load address data" 
          message={error.message || 'An error occurred while fetching the address data'} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to search
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Address Explorer</h1>
        <div className="flex items-center space-x-4">
          <code className="text-sm font-mono text-gray-600">{address}</code>
          <span className="text-gray-500">•</span>
          <p className="text-gray-600">
            {pagination.totalCount} total transfer{pagination.totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <PathStats paths={paths} address={address || ''} />

      <div className="card overflow-hidden p-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Transfer History</h2>
            <PathFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>
        <PathTable 
          paths={filteredPaths} 
          onSelectPath={(path) => handleSelectPath(path.id)}
          selectedPathId={selectedPathId}
        />
        {pagination.totalPages > 1 && (
          <div className="p-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}