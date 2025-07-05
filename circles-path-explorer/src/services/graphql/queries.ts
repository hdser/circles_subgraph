import { gql } from '@apollo/client';
import { PATH_FIELDS, HOP_FIELDS, AVATAR_FIELDS } from './fragments';

export const PATHS_BY_TRANSACTION = gql`
  ${PATH_FIELDS}
  query GetPathsByTransaction($txHash: String!) {
    transferPaths(where: { transactionHash: $txHash }) {
      ...PathFields
    }
  }
`;

export const HOPS_BY_PATH = gql`
  ${HOP_FIELDS}
  query GetHopsByPath($pathId: String!) {
    transferHops(where: { path: $pathId }, orderBy: hopIndex) {
      ...HopFields
    }
  }
`;

export const PATHS_BY_ADDRESS = gql`
  ${PATH_FIELDS}
  query GetPathsByAddress($address: String!, $first: Int!, $skip: Int!) {
    asOriginalSender: transferPaths(
      where: { originalSender: $address }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...PathFields
    }
    asFinalRecipient: transferPaths(
      where: { finalRecipient: $address }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...PathFields
    }
  }
`;

export const PATHS_WITH_HOPS = gql`
  ${PATH_FIELDS}
  ${HOP_FIELDS}
  query GetPathsWithHops($pathIds: [String!]!) {
    transferPaths(where: { id_in: $pathIds }) {
      ...PathFields
    }
    transferHops(where: { path_in: $pathIds }, orderBy: hopIndex) {
      ...HopFields
    }
  }
`;

export const AVATAR_DETAILS = gql`
  ${AVATAR_FIELDS}
  query GetAvatarDetails($addresses: [String!]!) {
    avatars(where: { id_in: $addresses }) {
      ...AvatarFields
    }
  }
`;

export const PATH_COUNT_BY_ADDRESS = gql`
  query GetPathCountByAddress($address: String!) {
    senderCount: transferPaths(where: { originalSender: $address }) {
      id
    }
    recipientCount: transferPaths(where: { finalRecipient: $address }) {
      id
    }
  }
`;