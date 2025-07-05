export interface TransferPath {
  id: string;
  transactionHash: string;
  originalSender: string;
  finalRecipient: string;
  isCircular: boolean;
  totalHops: number;
  totalPaths: number;
  receivedTokenIds: string[];
  receivedAmounts: string[];
  timestamp: string;
  blockNumber: string;
  logIndex: string;
  transferHops: TransferHop[];
}

export interface TransferHop {
  id: string;
  hopIndex: number;
  from: string;
  to: string;
  tokenId: string;
  tokenAddress: string;
  value: string;
  transferType: string;
  logIndex: string;
  batchIndex: number;
  pathNumber: number;
}

export interface Avatar {
  id: string;
  name?: string;
  avatarType: 'RegisterHuman' | 'RegisterGroup' | 'RegisterOrganization';
  tokenId?: string;
}

export interface SankeyNode {
  name: string;
  itemStyle?: {
    color: string;
  };
  label?: string;
  avatarType?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  tokenId: string;
  tokenOwner: string;
  lineStyle?: {
    color: string;
    opacity: number;
    curveness: number;
  };
}

export interface PathFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  minHops?: number;
  maxHops?: number;
  circularOnly?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type SearchType = 'transaction' | 'address';

export interface SearchState {
  type: SearchType;
  value: string;
  isSearching: boolean;
}