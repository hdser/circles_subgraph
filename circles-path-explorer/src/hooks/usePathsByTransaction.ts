import { useQuery } from '@apollo/client';
import { PATHS_BY_TRANSACTION, HOPS_BY_PATH } from '../services/graphql/queries';
import { TransferPath, TransferHop } from '../utils/types';

interface PathsByTransactionData {
  transferPaths: TransferPath[];
}

interface HopsByPathData {
  transferHops: TransferHop[];
}

interface PathsByTransactionVars {
  txHash: string;
}

interface HopsByPathVars {
  pathId: string;
}

export const usePathsByTransaction = (txHash: string) => {
  // First, get the paths
  const { data: pathsData, loading: pathsLoading, error: pathsError, refetch } = useQuery<
    PathsByTransactionData,
    PathsByTransactionVars
  >(PATHS_BY_TRANSACTION, {
    variables: { txHash: txHash.toLowerCase() },
    skip: !txHash,
  });

  // Get the first path ID to fetch hops (we'll need to handle multiple paths later)
  const pathIds = pathsData?.transferPaths.map(p => p.id) || [];

  // Fetch hops for all paths
  const { data: hopsData, loading: hopsLoading } = useQuery<HopsByPathData>(
    HOPS_BY_PATH,
    {
      variables: { pathId: pathIds[0] }, // For now, just get hops for first path
      skip: !pathIds.length,
    }
  );

  // Combine the data
  const paths = pathsData?.transferPaths.map(path => ({
    ...path,
    transferHops: hopsData?.transferHops || []
  })) || [];

  return {
    paths,
    loading: pathsLoading || hopsLoading,
    error: pathsError,
    refetch,
  };
};