import { TransferPath } from '../../utils/types';
import PathTable from '../paths/PathTable';
import PathStats from '../paths/PathStats';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface SearchResultsProps {
  paths: Array<TransferPath & { role: 'sender' | 'recipient' }>;
  loading: boolean;
  error: any;
  address?: string;
  onSelectPath: (path: TransferPath) => void;
  selectedPathId?: string;
}

export default function SearchResults({
  paths,
  loading,
  error,
  address,
  onSelectPath,
  selectedPathId,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Search failed"
        message={error.message || 'An error occurred while searching'}
      />
    );
  }

  if (paths.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No transfer paths found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {address && <PathStats paths={paths} address={address} />}
      <PathTable
        paths={paths}
        onSelectPath={onSelectPath}
        selectedPathId={selectedPathId}
      />
    </div>
  );
}