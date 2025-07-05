import { useQuery } from '@apollo/client';
import { PATHS_WITH_HOPS } from '../../services/graphql/queries';
import { TransferPath, TransferHop } from '../../utils/types';
import PathSankey from '../visualization/PathSankey';
import PathDetails from '../visualization/PathDetails';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { useMemo } from 'react';

interface ExpandedPathViewProps {
  path: TransferPath;
}

interface PathsWithHopsData {
  transferPaths: TransferPath[];
  transferHops: TransferHop[];
}

export default function ExpandedPathView({ path }: ExpandedPathViewProps) {
  const { data, loading, error } = useQuery<PathsWithHopsData>(PATHS_WITH_HOPS, {
    variables: { pathIds: [path.id] },
  });

  const pathWithHops = useMemo(() => {
    if (!data || !data.transferPaths.length) return null;
    
    const fullPath = data.transferPaths[0];

    const pathHops = data.transferHops.filter(hop => hop.id.startsWith(fullPath.id + '-'));
    
    return {
      ...fullPath,
      transferHops: pathHops.sort((a, b) => a.hopIndex - b.hopIndex),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Failed to load path details" message={error.message} />;
  }

  if (!pathWithHops) {
    return <div className="p-8 text-center text-gray-500">No details found for this path.</div>;
  }

  return (
    <div className="bg-gray-50 p-6 space-y-8">
      <PathSankey path={pathWithHops} />
      <PathDetails path={pathWithHops} />
    </div>
  );
}