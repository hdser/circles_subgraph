export const BLOCK_EXPLORER_URL = import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://gnosisscan.io';
export const SUBGRAPH_KEY = import.meta.env.VITE_SUBGRAPH_KEY;
export const SUBGRAPH_ID  = import.meta.env.VITE_SUBGRAPH_ID;
export const SUBGRAPH_URL = `https://gateway.thegraph.com/api/${SUBGRAPH_KEY}/subgraphs/id/${SUBGRAPH_ID}`;


export const PAGE_SIZE = 20;
export const DEBOUNCE_DELAY = 500;

export const AVATAR_TYPE_LABELS = {
  RegisterHuman: 'Human',
  RegisterGroup: 'Group',
  RegisterOrganization: 'Organization'
} as const;

export const AVATAR_TYPE_COLORS = {
  RegisterHuman: '#7B3FF2',
  RegisterGroup: '#10B981',
  RegisterOrganization: '#F59E0B'
} as const;

export const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
export const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;