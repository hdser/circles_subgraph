import { useQuery } from '@apollo/client';
import { PATHS_WITH_HOPS } from '../services/graphql/queries';
import { TransferPath, TransferHop } from '../utils/types';

interface PathsWithHopsData {
  transferPaths: TransferPath[];
  transferHops: TransferHop[];
}

interface PathsWithHopsVars {
  pathIds: string[];
}

export const usePathsWithHops = (pathIds: string[]) => {
  const { data, loading, error } = useQuery<PathsWithHopsData, PathsWithHopsVars>(
    PATHS_WITH_HOPS,
    {
      variables: { pathIds },
      skip: pathIds.length === 0,
    }
  );

  // Group hops by path
  const pathsWithHops = data?.transferPaths.map(path => {
    const pathHops = data.transferHops.filter(hop => hop.path === path.id);
    return {
      ...path,
      transferHops: pathHops,
    };
  }) || [];

  return {
    paths: pathsWithHops,
    loading,
    error,
  };
};