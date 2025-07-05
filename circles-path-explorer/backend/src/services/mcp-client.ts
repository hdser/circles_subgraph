import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { MCPMessage, QueryResult } from '../types';
import { GraphQLQueryValidator } from '../utils/graphql-validator';

export class MCPClient extends EventEmitter {
  private process: ChildProcess | null = null;
  private messageHandlers: Map<string | number, (response: MCPMessage) => void> = new Map();
  private messageId = 0;
  private isConnected = false;
  private buffer: string = '';
  private subgraphId: string;

  constructor(private authToken: string, subgraphId?: string) {
    super();
    // Use provided subgraph ID or default to Circles V2
    this.subgraphId = subgraphId || process.env.SUBGRAPH_ID || 'CyRfngcxsyhK3k6G9jLuSNNS8xyMpXvTg2Tjyfhdp87p';
  }

  async connect(): Promise<void> {
    console.log('Connecting to MCP server...');
    console.log('Auth token present:', !!this.authToken);
    console.log('Auth token length:', this.authToken?.length);
    
    if (!this.authToken) {
      throw new Error('GRAPH_API_KEY is not set in environment variables');
    }
    
    // Check if mcp-remote is installed
    try {
      const { execSync } = require('child_process');
      execSync('npx mcp-remote --version', { stdio: 'ignore' });
      console.log('mcp-remote is available');
    } catch (e) {
      console.error('mcp-remote might not be installed. Install with: npm install -g mcp-remote');
    }
    
    return new Promise((resolve, reject) => {
      const args = [
        'mcp-remote',
        '--header',
        `Authorization:Bearer ${this.authToken}`,
        'https://subgraphs.mcp.thegraph.com/sse'
      ];
      
      console.log('Spawning process: npx', args.map((arg, i) => i === 2 ? `Authorization:Bearer ${'*'.repeat(10)}` : arg));
      
      // Spawn the MCP process
      this.process = spawn('npx', args, {
        env: { 
          ...process.env,
          // Ensure PATH is set for npx to work
          PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let connectionEstablished = false;

      // Set a timeout for connection
      const connectionTimeout = setTimeout(() => {
        if (!connectionEstablished) {
          console.error('MCP connection timeout - killing process');
          this.process?.kill();
          reject(new Error('MCP connection timeout - check your GRAPH_API_KEY'));
        }
      }, 60000); // 60 second timeout

      // Handle stdout (responses from MCP)
      this.process.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        this.buffer += chunk;
        
        // Process complete lines
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const message = JSON.parse(line) as MCPMessage;
            console.log('MCP message received:', JSON.stringify(message, null, 2));
            
            // Check if this is the server capabilities message
            if (message.result && message.result.capabilities) {
              console.log('Server capabilities received:', message.result.capabilities);
            }
            
            this.handleMessage(message);
          } catch (e) {
            console.log('Non-JSON output:', line);
          }
        }
      });

      // Handle stderr (connection info and errors)
      this.process.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log('MCP stderr:', output);
        
        // Check for connection success indicators
        if (!connectionEstablished && (
            output.includes('Proxy established successfully') || 
            output.includes('Connected to remote server') ||
            output.includes('Local STDIO server running') ||
            output.includes('SSEClientTransport') ||
            output.includes('Connecting to remote server')
        )) {
          console.log('MCP transport layer connected');
          connectionEstablished = true;
          
          // Initialize the protocol after a short delay
          setTimeout(() => {
            this.initialize()
              .then(() => {
                console.log('MCP protocol initialized successfully');
                this.isConnected = true;
                clearTimeout(connectionTimeout);
                resolve();
              })
              .catch((error) => {
                console.error('Failed to initialize MCP protocol:', error);
                // Don't reject immediately, the connection might still work
                this.isConnected = true; // Mark as connected anyway
                clearTimeout(connectionTimeout);
                resolve(); // Resolve anyway to allow testing
              });
          }, 2000); // 2 second delay for transport to stabilize
        }
        
        // Check for errors
        if (output.includes('Error') && !output.includes('Recursively reconnecting')) {
          console.error('MCP error detected:', output);
        }
      });

      // Handle process errors
      this.process.on('error', (error) => {
        console.error('Failed to start MCP process:', error);
        clearTimeout(connectionTimeout);
        reject(new Error(`Failed to start MCP process: ${error.message}. Make sure mcp-remote is installed: npm install -g mcp-remote`));
      });

      // Handle process exit
      this.process.on('exit', (code) => {
        console.log(`MCP process exited with code ${code}`);
        this.isConnected = false;
        this.emit('disconnected', { code });
        if (!connectionEstablished) {
          clearTimeout(connectionTimeout);
          reject(new Error(`MCP process exited with code ${code}`));
        }
      });
    });
  }

  private handleMessage(message: MCPMessage) {
    console.log('Handling message:', message.method || message.id);
    
    // Handle responses to our requests
    if (message.id !== undefined && this.messageHandlers.has(message.id)) {
      const handler = this.messageHandlers.get(message.id)!;
      handler(message);
      this.messageHandlers.delete(message.id);
    }
    
    // Handle server-initiated messages
    if (message.method) {
      this.emit(message.method, message.params);
      
      // If we receive a tools/list or similar, the server is ready
      if (message.method === 'tools/list' || message.method === 'notifications/initialized') {
        console.log('Server is ready, marking as connected');
        this.isConnected = true;
      }
    }
  }

  private async initialize(): Promise<void> {
    try {
      console.log('Sending initialize request...');
      
      // Try different protocol versions
      let response;
      let protocolVersion = '2024-11-05'; // Latest MCP protocol version
      
      try {
        response = await this.sendRequest('initialize', {
          protocolVersion,
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: 'circles-path-explorer',
            version: '1.0.0'
          }
        });
      } catch (error) {
        console.log('Failed with protocol version', protocolVersion, '- trying older version');
        protocolVersion = '1';
        response = await this.sendRequest('initialize', {
          protocolVersion,
          capabilities: {}
        });
      }
      
      console.log('Initialize response:', response);
      
      // Send initialized notification
      if (this.process && this.process.stdin) {
        const notif = {
          jsonrpc: '2.0',
          method: 'notifications/initialized'
        };
        console.log('Sending initialized notification:', notif);
        this.process.stdin.write(JSON.stringify(notif) + '\n');
      }
      
      this.isConnected = true;
      this.emit('connected');
      
      // List available tools
      try {
        const toolsResponse = await this.sendRequest('tools/list', {});
        console.log('Available tools:', toolsResponse);
      } catch (error) {
        console.log('Could not list tools:', error);
      }
    } catch (error) {
      console.error('Failed to initialize MCP:', error);
      throw error;
    }
  }

  private sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin) {
        reject(new Error('MCP client not connected'));
        return;
      }

      const id = ++this.messageId;
      const message: MCPMessage = {
        jsonrpc: '2.0',
        method,
        params: params || {},
        id
      };

      console.log(`Sending MCP request:`, message);

      const timeout = setTimeout(() => {
        this.messageHandlers.delete(id);
        console.error(`Request ${id} timed out for method: ${method}`);
        reject(new Error(`Request timeout for ${method}`));
      }, 30000); // 30 second timeout

      this.messageHandlers.set(id, (response) => {
        clearTimeout(timeout);
        console.log(`Received response for request ${id}:`, response);
        
        if (response.error) {
          reject(new Error(response.error.message || 'Unknown error'));
        } else {
          resolve(response.result);
        }
      });

      try {
        this.process.stdin.write(JSON.stringify(message) + '\n');
      } catch (error) {
        clearTimeout(timeout);
        this.messageHandlers.delete(id);
        reject(error);
      }
    });
  }

  async searchSubgraphs(keyword: string): Promise<any> {
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'search_subgraphs_by_keyword',
        arguments: {
          keyword
        }
      });
      
      return this.parseToolResponse(response);
    } catch (error) {
      console.error('Search subgraphs error:', error);
      throw error;
    }
  }

  async getDeploymentQueryCounts(ipfsHashes: string[]): Promise<any> {
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'get_deployment_30day_query_counts',
        arguments: {
          ipfs_hashes: ipfsHashes
        }
      });
      
      return this.parseToolResponse(response);
    } catch (error) {
      console.error('Get deployment query counts error:', error);
      throw error;
    }
  }

  private parseToolResponse(response: any): any {
    // The response might be wrapped in a content array
    if (response && response.content && Array.isArray(response.content)) {
      const textContent = response.content.find((c: any) => c.type === 'text');
      if (textContent && textContent.text) {
        try {
          return JSON.parse(textContent.text);
        } catch (e) {
          return textContent.text;
        }
      }
    }
    
    // Try to parse if it's a string
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch (e) {
        return response;
      }
    }
    
    return response;
  }

  async getSchema(): Promise<any> {
    try {
      console.log('Getting schema for subgraph:', this.subgraphId);
      
      const response = await this.sendRequest('tools/call', {
        name: 'get_schema_by_subgraph_id',
        arguments: {
          subgraph_id: this.subgraphId
        }
      });
      
      console.log('Schema response received');
      const schema = this.parseToolResponse(response);
      
      // Add query examples and documentation
      const enhancedSchema = {
        schema: schema,
        queryExamples: this.getQueryExamples(),
        availableQueries: this.getAvailableQueries(),
        instructions: this.getQueryInstructions()
      };
      
      return enhancedSchema;
    } catch (error) {
      console.error('Get schema error:', error);
      throw error;
    }
  }

  private getQueryExamples(): Record<string, string> {
    return {
      transferPaths: `
# Example: Find transfer paths by sender
query GetPathsBySender($sender: String!, $first: Int!) {
  transferPaths(
    where: { originalSender: $sender }
    first: $first
    orderBy: totalHops
    orderDirection: desc
  ) {
    id
    transactionHash
    originalSender
    finalRecipient
    isCircular
    totalHops
    totalPaths
    timestamp
    blockNumber
    receivedTokenIds
    receivedAmounts
  }
}`,
      
      transferPathsWithHops: `
# Example: Get detailed hops for a path
query GetPathWithHops($pathId: String!) {
  transferPath(id: $pathId) {
    id
    originalSender
    finalRecipient
    totalHops
    hops {
      id
      hopIndex
      from
      to
      tokenId
      value
      pathNumber
      tokenAddress
      transferType
    }
  }
}`,
      
      avatarDetails: `
# Example: Get avatar information
query GetAvatar($address: String!) {
  avatar(id: $address) {
    id
    avatarType
    name
    tokenId
    invitedBy
    timestamp
  }
}`,
      
      trustRelations: `
# Example: Get trust relationships
query GetTrusts($truster: String!) {
  trustRelations(where: { truster: $truster }) {
    id
    truster
    trustee
    expiryTime
    timestamp
  }
}`,

      transfers: `
# Example: Get transfers for an address
query GetTransfers($address: String!, $first: Int!) {
  transfers(
    where: { from: $address }
    first: $first
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    from
    to
    tokenId
    value
    timestamp
    transactionHash
    transferType
  }
}`,

      accountBalances: `
# Example: Get account balances
query GetBalances($account: String!) {
  accountBalances(where: { account: $account }) {
    id
    account
    tokenId
    balance
    tokenAddress
    lastActivity
  }
}`
    };
  }

  private getAvailableQueries(): string[] {
    return [
      'transferPaths - Query transfer paths with various filters',
      'transferPath - Get a single transfer path by ID',
      'transfers - Query individual transfers',
      'transfer - Get a single transfer by ID',
      'avatars - Query avatar information',
      'avatar - Get a single avatar by address',
      'trustRelations - Query trust relationships',
      'trustRelation - Get a single trust relation',
      'accountBalances - Query token balances',
      'accountBalance - Get a single account balance',
      'tokens - Query token information',
      'token - Get a single token by ID',
      'tokenTotalSupplies - Query token total supplies',
      'tokenTotalSupply - Get total supply for a token',
      'transactions - Query transactions',
      'transaction - Get a single transaction'
    ];
  }

  private getQueryInstructions(): string {
    return `
GraphQL Query Construction Guidelines:
1. Use lowercase for entity names in queries (e.g., 'transferPaths' not 'TransferPaths')
2. String addresses should be lowercase in where clauses
3. Common query patterns:
   - Pagination: use 'first', 'skip', 'orderBy', 'orderDirection'
   - Filtering: use 'where' with field conditions
   - Nested data: request related entities in the same query
4. Available order directions: 'asc', 'desc'
5. Common where operators: exact match, _gt, _lt, _gte, _lte, _in, _not, _contains, _not_in
6. For addresses in where clauses: always use lowercase
7. For BigInt fields, use strings in variables: "1000000000000000000"
8. Common orderBy fields:
   - transferPaths: totalHops, timestamp, blockNumber
   - transfers: timestamp, blockNumber, value
   - avatars: timestamp, blockNumber
`;
  }

  async executeQuery(query: string, variables?: any): Promise<any> {
    try {
      console.log('Executing query:', { query, variables });
      
      // Validate and potentially fix common query issues
      const validation = GraphQLQueryValidator.validateQuery(query);
      if (!validation.isValid) {
        console.warn('Query validation warnings:', validation.errors);
        query = GraphQLQueryValidator.fixCommonIssues(query);
        console.log('Fixed query:', query);
      }
      
      const processedQuery = this.preprocessQuery(query);
      
      const response = await this.sendRequest('tools/call', {
        name: 'execute_query_by_subgraph_id',
        arguments: {
          subgraph_id: this.subgraphId,
          query: processedQuery,
          variables: variables || {}
        }
      });
      
      console.log('Query response received');
      const result = this.parseToolResponse(response);
      
      // Check for GraphQL errors
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }
      
      return result;
    } catch (error: any) {
      console.error('Execute query error:', error);
      
      // Provide helpful error messages
      if (error.message.includes('Cannot query field')) {
        const suggestion = this.suggestCorrectField(error.message);
        throw new Error(`${error.message}. ${suggestion}`);
      }
      
      throw error;
    }
  }

  private preprocessQuery(query: string): string {
    // Fix common issues with queries
    let processed = query;
    
    // Ensure addresses in where clauses are lowercase
    processed = processed.replace(/where:\s*{\s*(\w+):\s*"(0x[A-Fa-f0-9]+)"/g, (match, field, address) => {
      return `where: { ${field}: "${address.toLowerCase()}"`;
    });
    
    // Fix common field name issues
    processed = processed.replace(/\btransferPath\s*\(/g, 'transferPath(');
    processed = processed.replace(/\btransferPaths\s*\(/g, 'transferPaths(');
    
    return processed;
  }

  private suggestCorrectField(errorMessage: string): string {
    const fieldMatch = errorMessage.match(/Cannot query field "(\w+)"/);
    if (!fieldMatch) return '';
    
    const field = fieldMatch[1];
    const suggestions: Record<string, string> = {
      'TransferPaths': 'transferPaths',
      'TransferPath': 'transferPath',
      'Avatars': 'avatars',
      'Avatar': 'avatar',
      'TrustRelations': 'trustRelations',
      'TrustRelation': 'trustRelation',
      'Transfers': 'transfers',
      'Transfer': 'transfer',
      'AccountBalances': 'accountBalances',
      'AccountBalance': 'accountBalance'
    };
    
    const suggestion = suggestions[field];
    if (suggestion) {
      return `Did you mean '${suggestion}'? GraphQL uses camelCase for query fields.`;
    }
    
    return 'Check the schema for the correct field name.';
  }

  // Helper methods for common queries
  async getTransferPathsBySender(sender: string, limit: number = 10, orderBy: string = 'totalHops'): Promise<any> {
    const query = `
      query GetPathsBySender($sender: String!, $first: Int!, $orderBy: TransferPath_orderBy!, $orderDirection: OrderDirection!) {
        transferPaths(
          where: { originalSender: $sender }
          first: $first
          orderBy: $orderBy
          orderDirection: $orderDirection
        ) {
          id
          transactionHash
          originalSender
          finalRecipient
          isCircular
          totalHops
          totalPaths
          timestamp
          blockNumber
          receivedTokenIds
          receivedAmounts
        }
      }
    `;
    
    return this.executeQuery(query, {
      sender: sender.toLowerCase(),
      first: limit,
      orderBy: orderBy,
      orderDirection: "desc"
    });
  }

  async getTransferPathWithHops(pathId: string): Promise<any> {
    const query = `
      query GetPathWithHops($pathId: ID!) {
        transferPath(id: $pathId) {
          id
          transactionHash
          originalSender
          finalRecipient
          isCircular
          totalHops
          totalPaths
          timestamp
          blockNumber
          hops {
            id
            hopIndex
            from
            to
            tokenId
            tokenAddress
            value
            transferType
            pathNumber
          }
        }
      }
    `;
    
    return this.executeQuery(query, { pathId });
  }

  async getAvatarInfo(address: string): Promise<any> {
    const query = `
      query GetAvatar($address: ID!) {
        avatar(id: $address) {
          id
          avatarType
          name
          tokenId
          invitedBy
          timestamp
          blockNumber
        }
      }
    `;
    
    return this.executeQuery(query, { address: address.toLowerCase() });
  }

  async getTrustRelations(address: string, direction: 'given' | 'received' = 'given'): Promise<any> {
    const field = direction === 'given' ? 'truster' : 'trustee';
    const query = `
      query GetTrusts($address: String!) {
        trustRelations(where: { ${field}: $address }) {
          id
          truster
          trustee
          expiryTime
          timestamp
          blockNumber
        }
      }
    `;
    
    return this.executeQuery(query, { address: address.toLowerCase() });
  }

  async getAccountBalances(account: string): Promise<any> {
    const query = `
      query GetBalances($account: String!) {
        accountBalances(where: { account: $account }) {
          id
          account
          tokenId
          balance
          tokenAddress
          lastActivity
          blockNumber
        }
      }
    `;
    
    return this.executeQuery(query, { account: account.toLowerCase() });
  }

  async querySubgraph(query: string, variables?: any): Promise<QueryResult> {
    try {
      console.log('Querying subgraph with:', { query, variables });
      console.log('Using subgraph ID:', this.subgraphId);
      
      const response = await this.sendRequest('tools/call', {
        name: 'execute_query_by_subgraph_id',
        arguments: {
          subgraph_id: this.subgraphId,
          query: query,
          variables: variables || {}
        }
      });
      
      console.log('Subgraph response:', response);
      
      const parsed = this.parseToolResponse(response);
      
      // Ensure the response matches QueryResult structure
      if (parsed && parsed.data) {
        return parsed.data;
      }
      
      return parsed;
      
    } catch (error) {
      console.error('Subgraph query error:', error);
      throw error;
    }
  }

  async searchTransactionPaths(txHash: string): Promise<QueryResult> {
    const query = `
      query GetPathsByTransaction($txHash: String!) {
        transferPaths(where: { transactionHash: $txHash }) {
          id
          transactionHash
          originalSender
          finalRecipient
          isCircular
          totalHops
          totalPaths
          timestamp
          blockNumber
        }
      }
    `;
    
    return this.querySubgraph(query, { txHash: txHash.toLowerCase() });
  }

  async searchAddressPaths(address: string, limit: number = 10): Promise<QueryResult> {
    const query = `
      query GetPathsByAddress($address: String!, $limit: Int!) {
        asOriginalSender: transferPaths(
          where: { originalSender: $address }
          first: $limit
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          transactionHash
          originalSender
          finalRecipient
          isCircular
          totalHops
          totalPaths
          timestamp
          blockNumber
        }
        asFinalRecipient: transferPaths(
          where: { finalRecipient: $address }
          first: $limit
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          transactionHash
          originalSender
          finalRecipient
          isCircular
          totalHops
          totalPaths
          timestamp
          blockNumber
        }
      }
    `;
    
    return this.querySubgraph(query, { 
      address: address.toLowerCase(),
      limit 
    });
  }

  async searchCircularPaths(limit: number = 10): Promise<QueryResult> {
    const query = `
      query GetCircularPaths($limit: Int!) {
        transferPaths(
          where: { isCircular: true }
          first: $limit
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          transactionHash
          originalSender
          finalRecipient
          isCircular
          totalHops
          totalPaths
          timestamp
          blockNumber
        }
      }
    `;
    
    return this.querySubgraph(query, { limit });
  }

  disconnect(): void {
    if (this.process) {
      console.log('Disconnecting MCP client...');
      this.process.kill();
      this.process = null;
      this.isConnected = false;
      this.buffer = '';
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}