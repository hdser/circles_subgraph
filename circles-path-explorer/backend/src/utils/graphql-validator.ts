export class GraphQLQueryValidator {
  static validateQuery(query: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for common mistakes
    if (query.includes('TransferPath') && !query.includes('transferPath')) {
      errors.push('Use camelCase for query names (transferPaths, not TransferPaths)');
    }
    
    // Check for PascalCase entity names
    const pascalCaseEntities = [
      'TransferPaths', 'TransferPath', 'Avatars', 'Avatar',
      'TrustRelations', 'TrustRelation', 'Transfers', 'Transfer',
      'AccountBalances', 'AccountBalance', 'Tokens', 'Token'
    ];
    
    for (const entity of pascalCaseEntities) {
      if (query.includes(entity)) {
        const camelCase = entity.charAt(0).toLowerCase() + entity.slice(1);
        errors.push(`Use '${camelCase}' instead of '${entity}'`);
      }
    }
    
    // Check for uppercase addresses in where clauses
    const addressRegex = /where:\s*{[^}]*"(0x[A-F][A-Fa-f0-9]*)"[^}]*}/g;
    const matches = query.matchAll(addressRegex);
    for (const match of matches) {
      if (match[1] !== match[1].toLowerCase()) {
        errors.push(`Address ${match[1]} should be lowercase`);
      }
    }
    
    // Check for missing quotes around string values
    const whereClauseRegex = /where:\s*{([^}]+)}/g;
    const whereMatches = query.matchAll(whereClauseRegex);
    for (const match of whereMatches) {
      const clause = match[1];
      // Simple check for unquoted hex values
      if (/:\s*0x[a-fA-F0-9]+(?!")/.test(clause)) {
        errors.push('String values in where clauses must be quoted');
      }
      
      // Check for unquoted string enums
      if (/orderDirection:\s*(?!["'])(asc|desc)(?!["'])/.test(clause)) {
        errors.push('orderDirection values must be quoted: "asc" or "desc"');
      }
    }
    
    // Check for incorrect field names
    if (query.includes('skip:') && query.includes('limit:')) {
      errors.push('Use "first" instead of "limit" for pagination');
    }
    
    // Check for missing orderDirection when orderBy is used
    if (query.includes('orderBy:') && !query.includes('orderDirection:')) {
      errors.push('When using orderBy, also specify orderDirection: "asc" or "desc"');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static fixCommonIssues(query: string): string {
    let fixed = query;
    
    // Fix PascalCase to camelCase
    const replacements: Record<string, string> = {
      'TransferPaths': 'transferPaths',
      'TransferPath': 'transferPath',
      'Avatars': 'avatars',
      'Avatar': 'avatar',
      'TrustRelations': 'trustRelations',
      'TrustRelation': 'trustRelation',
      'Transfers': 'transfers',
      'Transfer': 'transfer',
      'AccountBalances': 'accountBalances',
      'AccountBalance': 'accountBalance',
      'Tokens': 'tokens',
      'Token': 'token',
      'TokenTotalSupplies': 'tokenTotalSupplies',
      'TokenTotalSupply': 'tokenTotalSupply',
      'Transactions': 'transactions',
      'Transaction': 'transaction'
    };
    
    for (const [incorrect, correct] of Object.entries(replacements)) {
      // Use word boundaries to avoid replacing parts of other words
      const regex = new RegExp(`\\b${incorrect}\\b`, 'g');
      fixed = fixed.replace(regex, correct);
    }
    
    // Fix uppercase addresses
    fixed = fixed.replace(/"(0x[A-Fa-f0-9]+)"/g, (match, address) => {
      return `"${address.toLowerCase()}"`;
    });
    
    // Fix unquoted orderDirection values
    fixed = fixed.replace(/orderDirection:\s*(asc|desc)(?!["'])/g, 'orderDirection: "$1"');
    
    // Fix limit to first
    fixed = fixed.replace(/\blimit:/g, 'first:');
    
    // Add quotes around unquoted hex values in where clauses
    fixed = fixed.replace(/(\w+):\s*(0x[a-fA-F0-9]+)(?!")/g, '$1: "$2"');
    
    return fixed;
  }
  
  static generateQueryTemplate(entityType: string): string {
    const templates: Record<string, string> = {
      transferPaths: `query GetTransferPaths($first: Int!, $skip: Int, $where: TransferPath_filter) {
  transferPaths(first: $first, skip: $skip, where: $where, orderBy: timestamp, orderDirection: desc) {
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
      avatars: `query GetAvatars($first: Int!, $where: Avatar_filter) {
  avatars(first: $first, where: $where, orderBy: timestamp, orderDirection: desc) {
    id
    avatarType
    name
    tokenId
    invitedBy
    timestamp
    blockNumber
  }
}`,
      trustRelations: `query GetTrustRelations($where: TrustRelation_filter) {
  trustRelations(where: $where) {
    id
    truster
    trustee
    expiryTime
    timestamp
    blockNumber
  }
}`,
      transfers: `query GetTransfers($first: Int!, $where: Transfer_filter) {
  transfers(first: $first, where: $where, orderBy: timestamp, orderDirection: desc) {
    id
    from
    to
    tokenId
    value
    timestamp
    transactionHash
    transferType
    tokenAddress
  }
}`
    };
    
    return templates[entityType] || '';
  }
}