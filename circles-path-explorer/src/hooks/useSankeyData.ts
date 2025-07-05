import { useMemo } from 'react';
import { TransferPath } from '../utils/types';
import { transformPathToSankey } from '../services/sankey/transformer';
import { useAvatarDetails } from './useAvatarDetails';

export const useSankeyData = (path: TransferPath | null) => {
  // Collect all unique addresses from the path
  const addresses = useMemo(() => {
    if (!path) return [];
    
    const addressSet = new Set<string>();
    addressSet.add(path.originalSender);
    addressSet.add(path.finalRecipient);
    
    path.transferHops.forEach(hop => {
      addressSet.add(hop.from);
      addressSet.add(hop.to);
    });
    
    return Array.from(addressSet);
  }, [path]);

  const { avatarMap, loading: avatarsLoading } = useAvatarDetails(addresses);

  const sankeyData = useMemo(() => {
    if (!path || avatarsLoading) return null;
    return transformPathToSankey(path, avatarMap);
  }, [path, avatarMap, avatarsLoading]);

  return {
    sankeyData,
    loading: avatarsLoading,
  };
};