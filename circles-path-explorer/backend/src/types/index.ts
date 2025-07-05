export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    results?: any;
    action?: string;
    error?: boolean;
    query?: string | null;
    variables?: any;
    // Add specific metadata fields that can be included
    txHash?: string;
    address?: string;
    limit?: number;
    // Allow for any other properties
    [key: string]: any;
  };
}

export interface MCPMessage {
  jsonrpc: '2.0';
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code?: number;
    message: string;
    data?: any;
  };
  id?: string | number;
}

export interface SearchIntent {
  type: 'search_transaction' | 'search_address' | 'query_circular' | 'explain' | 'help' | 'unknown';
  parameters: {
    txHash?: string;
    address?: string;
    limit?: number;
    query?: string;
  };
  confidence: number;
}

export interface TransferPath {
  id: string;
  transactionHash: string;
  originalSender: string;
  finalRecipient: string;
  isCircular: boolean;
  totalHops: number;
  totalPaths: number;
  timestamp: string;
  blockNumber: string;
  receivedTokenIds: string[];
  receivedAmounts: string[];
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

export interface QueryResult {
  transferPaths?: TransferPath[];
  asOriginalSender?: TransferPath[];
  asFinalRecipient?: TransferPath[];
  error?: string;
  [key: string]: any; // Allow for other query results
}

export interface Avatar {
  id: string;
  avatarType: 'RegisterHuman' | 'RegisterGroup' | 'RegisterOrganization';
  name?: string;
  tokenId?: string;
  invitedBy?: string;
  timestamp: string;
  blockNumber: string;
}

export interface TrustRelation {
  id: string;
  truster: string;
  trustee: string;
  expiryTime: string;
  timestamp: string;
  blockNumber: string;
}

export interface AccountBalance {
  id: string;
  account: string;
  tokenId: string;
  balance: string;
  tokenAddress: string;
  lastActivity: string;
  blockNumber: string;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  tokenId: string;
  value: string;
  timestamp: string;
  transactionHash: string;
  transferType: string;
  tokenAddress: string;
  eventIndex: number;
}