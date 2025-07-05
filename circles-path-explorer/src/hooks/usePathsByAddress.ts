import { useQuery } from '@apollo/client';
import { useState, useMemo } from 'react';
import { PATHS_BY_ADDRESS, PATH_COUNT_BY_ADDRESS } from '../services/graphql/queries';
import { TransferPath } from '../utils/types';
import { PAGE_SIZE } from '../utils/constants';

interface PathsByAddressData {
  asOriginalSender: TransferPath[];
  asFinalRecipient: TransferPath[];
}

interface PathsByAddressVars {
  address: string;
  first: number;
  skip: number;
}

interface PathCountData {
  senderCount: { id: string }[];
  recipientCount: { id: string }[];
}

export const usePathsByAddress = (address: string) => {
  const [page, setPage] = useState(0);
  const skip = page * PAGE_SIZE;

  // Get total count first
  const { data: countData } = useQuery<PathCountData>(PATH_COUNT_BY_ADDRESS, {
    variables: { address: address.toLowerCase() },
    skip: !address,
  });

  // Get paginated paths
  const { data, loading, error, refetch } = useQuery<
    PathsByAddressData,
    PathsByAddressVars
  >(PATHS_BY_ADDRESS, {
    variables: {
      address: address.toLowerCase(),
      first: PAGE_SIZE,
      skip,
    },
    skip: !address,
  });

  // Combine and sort paths
  const paths = useMemo(() => {
    if (!data) return [];
    
    const allPaths = [
      ...data.asOriginalSender.map(p => ({ ...p, role: 'sender' as const })),
      ...data.asFinalRecipient.map(p => ({ ...p, role: 'recipient' as const })),
    ];

    // Sort by timestamp descending
    return allPaths.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [data]);

  const totalCount = (countData?.senderCount.length || 0) + (countData?.recipientCount.length || 0);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    paths,
    loading,
    error,
    refetch,
    pagination: {
      page,
      setPage,
      totalPages,
      totalCount,
      hasNext: page < totalPages - 1,
      hasPrev: page > 0,
    },
  };
};