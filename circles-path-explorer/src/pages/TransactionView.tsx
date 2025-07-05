import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { PATHS_BY_TRANSACTION, PATHS_WITH_HOPS } from '../services/graphql/queries';
import { TransferPath, TransferHop } from '../utils/types';
import PathSankey from '../components/visualization/PathSankey';
import PathDetails from '../components/visualization/PathDetails';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

interface PathsByTransactionData {
  transferPaths: TransferPath[];
}

interface PathsWithHopsData {
  transferPaths: TransferPath[];
  transferHops: TransferHop[];
}

export default function TransactionView() {
  const { hash } = useParams<{ hash: string }>();
  
  // First get paths
  const { data: pathsData, loading: pathsLoading, error: pathsError } = useQuery<PathsByTransactionData>(
    PATHS_BY_TRANSACTION,
    {
      variables: { txHash: hash?.toLowerCase() || '' },
      skip: !hash,
    }
  );

  const pathIds = pathsData?.transferPaths.map(p => p.id) || [];

  // Then get paths with hops
  const { data: fullData, loading: hopsLoading } = useQuery<PathsWithHopsData>(
    PATHS_WITH_HOPS,
    {
      variables: { pathIds },
      skip: pathIds.length === 0,
    }
  );

  // Debug logging
  console.log('Path IDs:', pathIds);
  console.log('Full Data:', fullData);
  console.log('Transfer Hops:', fullData?.transferHops);

  // Combine the data
  const paths = fullData?.transferPaths.map(path => {
    // The hops are linked by ID pattern: pathId-hopIndex
    const pathHops = fullData.transferHops.filter(hop => {
      // Check if the hop ID starts with the path ID
      const hopBelongsToPath = hop.id.startsWith(path.id + '-');
      return hopBelongsToPath;
    });
    
    console.log(`Found ${pathHops.length} hops for path ${path.id}`);
    
    return {
      ...path,
      transferHops: pathHops.sort((a, b) => a.hopIndex - b.hopIndex),
    };
  }) || pathsData?.transferPaths.map(p => ({ ...p, transferHops: [] })) || [];

  const loading = pathsLoading || hopsLoading;
  const error = pathsError;

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
          title="Failed to load transaction" 
          message={error.message || 'An error occurred while fetching the transaction data'} 
        />
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to search
        </Link>
        <div className="card text-center">
          <h2 className="text-xl font-semibold mb-2">No Transfer Paths Found</h2>
          <p className="text-gray-600">
            No transfer paths were found for transaction hash:
          </p>
          <code className="text-sm font-mono text-gray-500 mt-2 block">{hash}</code>
        </div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Analysis</h1>
        <p className="text-gray-600">
          Found {paths.length} transfer path{paths.length > 1 ? 's' : ''} in this transaction
        </p>
      </div>

      <div className="space-y-8">
        {paths.map((path, index) => (
          <div key={path.id} className="space-y-6">
            {paths.length > 1 && (
              <h2 className="text-xl font-semibold text-gray-900">
                Path {index + 1} of {paths.length}
              </h2>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2">
                <PathSankey path={path} />
              </div>
              
              <div className="lg:col-span-2">
                <PathDetails path={path} />
              </div>
            </div>

            {index < paths.length - 1 && (
              <hr className="border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}