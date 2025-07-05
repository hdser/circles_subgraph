import { TransferHop } from '../../utils/types';
import { getTokenColor } from '../../services/sankey/colorScheme';
import { formatAddress } from '../../utils/formatters';

interface TokenLegendProps {
  transferHops: TransferHop[];
}

export default function TokenLegend({ transferHops }: TokenLegendProps) {
  // Get unique tokens
  const uniqueTokens = Array.from(
    new Set(transferHops.map(hop => hop.tokenAddress))
  );

  if (uniqueTokens.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Token Legend</h4>
      <div className="space-y-2">
        {uniqueTokens.map(tokenAddress => (
          <div key={tokenAddress} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getTokenColor(tokenAddress) }}
            />
            <code className="text-xs font-mono text-gray-600">
              {formatAddress(tokenAddress)}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}