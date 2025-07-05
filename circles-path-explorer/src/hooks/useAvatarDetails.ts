import { useQuery } from '@apollo/client';
import { AVATAR_DETAILS } from '../services/graphql/queries';
import { Avatar } from '../utils/types';

interface AvatarDetailsData {
  avatars: Avatar[];
}

interface AvatarDetailsVars {
  addresses: string[];
}

export const useAvatarDetails = (addresses: string[]) => {
  const { data, loading, error } = useQuery<AvatarDetailsData, AvatarDetailsVars>(
    AVATAR_DETAILS,
    {
      variables: {
        addresses: addresses.map(addr => addr.toLowerCase()),
      },
      skip: addresses.length === 0,
    }
  );

  // Create a map for easy lookup
  const avatarMap = new Map<string, Avatar>();
  data?.avatars.forEach(avatar => {
    avatarMap.set(avatar.id.toLowerCase(), avatar);
  });

  return {
    avatars: data?.avatars || [],
    avatarMap,
    loading,
    error,
  };
};