import { ChatMessage, QueryResult, TransferPath } from '../types';
import { MCPClient } from './mcp-client';
import { OpenAIService } from './openai-service';

export class ChatSession {
  private messages: ChatMessage[] = [];
  private mcpClient: MCPClient;
  private openAIService: OpenAIService;
  private isInitialized = false;
  private schema: any = null;

  constructor(
    private sessionId: string,
    graphApiKey: string,
    openAIApiKey: string,
    openAIModel?: string
  ) {
    const subgraphId = process.env.SUBGRAPH_ID;
    this.mcpClient = new MCPClient(graphApiKey, subgraphId);
    this.openAIService = new OpenAIService(openAIApiKey, openAIModel);
  }

  async initialize(): Promise<void> {
    try {
      await this.mcpClient.connect();
      
      // Get the enhanced schema
      try {
        console.log('Fetching subgraph schema...');
        const schemaResponse = await this.mcpClient.getSchema();
        this.schema = schemaResponse;
        console.log('Schema fetched successfully');
        
        // If we got an enhanced schema, log available queries
        if (schemaResponse && schemaResponse.availableQueries) {
          console.log('Available queries:', schemaResponse.availableQueries);
        }
      } catch (error) {
        console.error('Failed to fetch schema:', error);
        // Continue without schema - queries might still work
      }
      
      this.isInitialized = true;
      
      // Enhanced welcome message with examples
      this.messages.push({
        id: 'welcome',
        role: 'assistant',
        content: "👋 Welcome to Circles Path Explorer! I can help you:\n\n" +
                "• **Search for transfer paths** (e.g., 'find paths from 0x42cEDde51198D1773590311E2A340DC06B24cB37')\n" +
                "• **Find complex multi-hop transfers** (e.g., 'show me the top 5 paths by number of hops')\n" +
                "• **Explore trust relationships** (e.g., 'who trusts address 0x...')\n" +
                "• **Get avatar information** (e.g., 'what type of avatar is 0x...')\n" +
                "• **Check token balances** (e.g., 'show balances for 0x...')\n" +
                "• **Analyze circular transfers** (e.g., 'find recent circular transfers')\n\n" +
                "**Try asking:** 'Find the most complex transfer paths from address 0x42cEDde51198D1773590311E2A340DC06B24cB37'\n\n" +
                "💡 **Tip:** You can paste any Ethereum address or transaction hash to explore it!",
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      throw error;
    }
  }

  async processMessage(userMessage: string): Promise<ChatMessage> {
    if (!this.isInitialized) {
      throw new Error('Chat session not initialized');
    }

    // Add user message to history
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.messages.push(userMsg);

    try {
      // First, try to detect if this is a simple intent we can handle directly
      const intent = await this.openAIService.analyzeIntent(userMessage);
      
      // For high-confidence simple intents, use helper methods
      if (intent.confidence > 0.9) {
        switch (intent.type) {
          case 'search_transaction':
            return await this.handleTransactionSearch(intent.parameters.txHash!);
          case 'search_address':
            return await this.handleAddressSearch(intent.parameters.address!);
          case 'query_circular':
            return await this.handleCircularQuery(intent.parameters.limit || 10);
        }
      }

      // For complex queries, use OpenAI to generate GraphQL
      const { query, variables, explanation } = await this.openAIService.generateGraphQLQuery(
        userMessage,
        this.messages,
        this.schema
      );

      let finalResponse = explanation;
      let metadata: any = { query, variables };

      // Execute the query if one was generated
      if (query) {
        try {
          const queryResults = await this.mcpClient.executeQuery(query, variables);
          metadata.results = queryResults;
          
          // Generate response based on the results
          finalResponse = await this.openAIService.generateResultsResponse(
            userMessage,
            queryResults,
            query,
            this.messages
          );
        } catch (error: any) {
          console.error('Query execution error:', error);
          
          // Try to provide a helpful error message
          if (error.message.includes('Cannot query field')) {
            finalResponse = `I understood your request but there was an issue with the query. ${error.message}\n\nLet me try a different approach. What specific information are you looking for?`;
          } else {
            finalResponse = `I understood your request and tried to query for: ${explanation}\n\nHowever, the query failed with error: ${error.message}\n\nLet me try a different approach or you can rephrase your question.`;
          }
        }
      }

      // Create assistant message
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: finalResponse,
        timestamp: new Date(),
        metadata
      };
      this.messages.push(assistantMsg);

      return assistantMsg;

    } catch (error: any) {
      console.error('Error processing message:', error);
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: `I encountered an error: ${error.message}. Please try again or rephrase your question.`,
        timestamp: new Date(),
        metadata: { error: true }
      };
      this.messages.push(errorMsg);
      return errorMsg;
    }
  }

  private async handleTransactionSearch(txHash: string): Promise<ChatMessage> {
    try {
      const results = await this.mcpClient.searchTransactionPaths(txHash);
      const response = await this.openAIService.generateResultsResponse(
        `Show transfer paths for transaction ${txHash}`,
        results,
        'searchTransactionPaths',
        this.messages
      );
      
      const message: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { 
          action: 'search_transaction',
          txHash,
          results 
        }
      };
      this.messages.push(message);
      return message;
    } catch (error: any) {
      throw error;
    }
  }

  private async handleAddressSearch(address: string): Promise<ChatMessage> {
    try {
      const results = await this.mcpClient.searchAddressPaths(address, 20);
      const response = await this.openAIService.generateResultsResponse(
        `Show transfer paths for address ${address}`,
        results,
        'searchAddressPaths',
        this.messages
      );
      
      const message: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { 
          action: 'search_address',
          address,
          results 
        }
      };
      this.messages.push(message);
      return message;
    } catch (error: any) {
      throw error;
    }
  }

  private async handleCircularQuery(limit: number): Promise<ChatMessage> {
    try {
      const results = await this.mcpClient.searchCircularPaths(limit);
      const response = await this.openAIService.generateResultsResponse(
        `Show ${limit} recent circular transfers`,
        results,
        'searchCircularPaths',
        this.messages
      );
      
      const message: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { 
          action: 'query_circular',
          limit,
          results 
        }
      };
      this.messages.push(message);
      return message;
    } catch (error: any) {
      throw error;
    }
  }

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  disconnect(): void {
    this.mcpClient.disconnect();
  }
}