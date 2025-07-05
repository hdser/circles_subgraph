import { gql } from '@apollo/client';

export const PATH_FIELDS = gql`
  fragment PathFields on TransferPath {
    id
    transactionHash
    originalSender
    finalRecipient
    isCircular
    totalHops
    totalPaths
    receivedTokenIds
    receivedAmounts
    timestamp
    blockNumber
    logIndex
  }
`;

export const HOP_FIELDS = gql`
  fragment HopFields on TransferHop {
    id
    hopIndex
    from
    to
    tokenId
    tokenAddress
    value
    transferType
    logIndex
    batchIndex
    pathNumber
  }
`;

export const AVATAR_FIELDS = gql`
  fragment AvatarFields on Avatar {
    id
    name
    avatarType
    tokenId
  }
`;