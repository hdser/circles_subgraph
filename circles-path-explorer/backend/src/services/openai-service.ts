import OpenAI from 'openai';
import { ChatMessage, SearchIntent } from '../types';

interface EnhancedSchema {
  schema: string;
  queryExamples: Record<string, string>;
  availableQueries: string[];
  instructions: string;
}

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-turbo-preview') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateGraphQLQuery(
    userMessage: string,
    conversationHistory: ChatMessage[],
    schema: string | EnhancedSchema | null
  ): Promise<{
    query: string | null;
    variables: any;
    explanation: string;
  }> {
    // Parse enhanced schema if available
    let schemaContext = '';
    let examples = '';
    
    if (schema && typeof schema === 'object' && 'schema' in schema) {
      // Using enhanced schema - TypeScript now knows this is EnhancedSchema
      const enhancedSchema = schema as EnhancedSchema;
      schemaContext = `You have access to a GraphQL API with the following schema:\n\n${enhancedSchema.schema}\n\n`;
      schemaContext += `Available queries: ${enhancedSchema.availableQueries.join(', ')}\n\n`;
      schemaContext += `${enhancedSchema.instructions}\n\n`;
      
      // Add relevant examples based on user query
      const queryType = this.detectQueryType(userMessage);
      if (queryType && enhancedSchema.queryExamples[queryType]) {
        examples = `Here's a relevant example:\n${enhancedSchema.queryExamples[queryType]}\n\n`;
      }
    } else if (schema && typeof schema === 'string') {
      schemaContext = `You have access to a GraphQL API with the following schema:\n\n${schema}\n\n`;
    } else {
      schemaContext = 'You have access to a GraphQL API for querying Circles V2 data.\n\n';
    }

    const systemPrompt = `You are a helpful assistant for the Circles Path Explorer application.

${schemaContext}

${examples}

Your task is to understand the user's request and generate an appropriate GraphQL query if needed.

Important rules for GraphQL queries:
1. Use camelCase for query fields (e.g., 'transferPaths' not 'TransferPaths')
2. Convert all Ethereum addresses to lowercase in where clauses
3. String values in where clauses must be quoted
4. For pagination, use 'first' and 'skip' parameters
5. For sorting, use 'orderBy' and 'orderDirection' (values: "asc" or "desc")
6. When querying paths, include relevant nested fields like 'hops'
7. BigInt values should be passed as strings in variables

Common query patterns:
- Finding paths by address: where: { originalSender: "0x..." } or where: { finalRecipient: "0x..." }
- Sorting by hops: orderBy: totalHops, orderDirection: desc
- Getting detailed hop information: include hops { ... } in the query
- Finding circular transfers: where: { isCircular: true }
- Filtering by multiple conditions: where: { originalSender: "0x...", isCircular: true }

Entity relationships:
- transferPaths have hops (one-to-many)
- avatars have trustRelations as truster or trustee
- transfers reference tokens
- accountBalances link accounts to tokens

Common fields to include:
- For transferPaths: id, transactionHash, originalSender, finalRecipient, isCircular, totalHops, totalPaths, timestamp, blockNumber, receivedTokenIds, receivedAmounts
- For hops: id, hopIndex, from, to, tokenId, tokenAddress, value, transferType, pathNumber
- For avatars: id, avatarType, name, tokenId, invitedBy, timestamp
- For trustRelations: id, truster, trustee, expiryTime, timestamp

Return a JSON response with:
{
  "query": "the GraphQL query or null if not needed",
  "variables": { "any": "variables" },
  "explanation": "what you're trying to find"
}`;

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: systemPrompt
        },
        ...conversationHistory.slice(-5).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: "user",
          content: userMessage
        }
      ];

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(response);
      
      // Ensure all addresses in variables are lowercase
      if (parsed.variables) {
        for (const key in parsed.variables) {
          const value = parsed.variables[key];
          if (typeof value === 'string' && value.match(/^0x[a-fA-F0-9]{40}$/)) {
            parsed.variables[key] = value.toLowerCase();
          }
        }
      }

      return parsed;
    } catch (error) {
      console.error('OpenAI query generation error:', error);
      throw error;
    }
  }

  async generateResultsResponse(
    userMessage: string,
    queryResults: any,
    query: string,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    const systemPrompt = `You are a helpful assistant for the Circles Path Explorer application.
You just executed a GraphQL query based on the user's request and received results.

Format the results in a clear, human-readable way:
- Use markdown formatting
- Highlight key information
- Provide counts and summaries
- For addresses, format them as shortened (0x1234...5678)
- For avatar types, use emojis: 👤 Human, 👥 Group, 🏢 Organization
- Include relevant links using the format [View details →](/address/0x...)
- For transfer amounts, divide by 10^18 to convert from wei to tokens
- Show dates in a readable format

Be concise but informative. Focus on answering the user's specific question.

Common patterns:
- For transfer paths: Show sender → recipient, hop count, whether circular
- For complex paths: Highlight the most interesting ones (highest hops, circular transfers)
- For balances: Show token amounts in readable format
- For trust relations: Show who trusts whom with expiry information`;

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `User asked: "${userMessage}"\n\nQuery executed:\n${query}\n\nResults:\n${JSON.stringify(queryResults, null, 2)}\n\nPlease format these results in a helpful way.`
        }
      ];

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.5,
        max_tokens: 1000,
      });

      return completion.choices[0].message.content || 'I found the data but had trouble formatting the response.';
    } catch (error) {
      console.error('OpenAI response generation error:', error);
      throw error;
    }
  }

  private detectQueryType(userMessage: string): string | null {
    const lowercase = userMessage.toLowerCase();
    
    if (lowercase.includes('path') || lowercase.includes('transfer')) {
      if (lowercase.includes('hop') || lowercase.includes('detail')) {
        return 'transferPathsWithHops';
      }
      return 'transferPaths';
    }
    
    if (lowercase.includes('avatar') || lowercase.includes('user') || lowercase.includes('who is')) {
      return 'avatarDetails';
    }
    
    if (lowercase.includes('trust') || lowercase.includes('trusts')) {
      return 'trustRelations';
    }
    
    if (lowercase.includes('balance') || lowercase.includes('token')) {
      return 'accountBalances';
    }
    
    if (lowercase.includes('transfer') && !lowercase.includes('path')) {
      return 'transfers';
    }
    
    return null;
  }

  async analyzeIntent(userMessage: string): Promise<SearchIntent> {
    const lowercase = userMessage.toLowerCase();
    
    // Check for transaction hash (66 characters including 0x)
    const txHashMatch = userMessage.match(/0x[a-fA-F0-9]{64}/);
    if (txHashMatch) {
      return {
        type: 'search_transaction',
        parameters: { txHash: txHashMatch[0] },
        confidence: 0.95
      };
    }
    
    // Check for address (42 characters including 0x)
    const addressMatch = userMessage.match(/0x[a-fA-F0-9]{40}/);
    if (addressMatch) {
      return {
        type: 'search_address',
        parameters: { address: addressMatch[0] },
        confidence: 0.9
      };
    }
    
    // Check for circular transfer queries
    if (lowercase.includes('circular')) {
      return {
        type: 'query_circular',
        parameters: { limit: 10 },
        confidence: 0.85
      };
    }
    
    // Check for help requests
    if (lowercase.includes('help') || lowercase.includes('how') || lowercase.includes('what')) {
      return {
        type: 'help',
        parameters: {},
        confidence: 0.8
      };
    }
    
    // Check for explanation requests
    if (lowercase.includes('explain') || lowercase.includes('understand')) {
      return {
        type: 'explain',
        parameters: { query: userMessage },
        confidence: 0.75
      };
    }
    
    return {
      type: 'unknown',
      parameters: { query: userMessage },
      confidence: 0.5
    };
  }

  private getDefaultResponse(intentType: string): string {
    const responses: Record<string, string> = {
      search_transaction: "I'll search for transfer paths in this transaction...",
      search_address: "Let me look up all transfers for this address...",
      query_circular: "I'll find recent circular transfers in the network...",
      explain: "I can help you explore the Circles network. What would you like to know?",
      help: "I can help you search for transactions, explore addresses, or find circular transfers.",
      unknown: "I'm not sure what you're looking for. Could you provide a transaction hash or address?"
    };
    return responses[intentType] || responses.unknown;
  }
}