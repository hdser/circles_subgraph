import { useState } from 'react';
import { TransferPath } from '../../utils/types';
import { formatAddress, formatCRC, weiToCrc, formatTimestamp } from '../../utils/formatters';
import { aggregateTransfersByPath } from '../../services/sankey/transformer';
import { Copy, ExternalLink } from 'lucide-react';
import { copyToClipboard, getBlockExplorerUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Pagination from '../common/Pagination';

interface PathDetailsProps {
  path: TransferPath;
}

const PATHS_PER_PAGE = 5;

export default function PathDetails({ path }: PathDetailsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pathGroups = aggregateTransfersByPath(path.transferHops);
  const pathEntries = Array.from(pathGroups.entries());

  const totalPages = Math.ceil(pathEntries.length / PATHS_PER_PAGE);

  const paginatedPaths = pathEntries.slice(
    currentPage * PATHS_PER_PAGE,
    (currentPage + 1) * PATHS_PER_PAGE
  );

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Path Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Original Sender</p>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-sm font-mono">{formatAddress(path.originalSender)}</code>
              <button
                onClick={() => handleCopy(path.originalSender)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </button>
              <a
                href={getBlockExplorerUrl('address', path.originalSender)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Final Recipient</p>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-sm font-mono">{formatAddress(path.finalRecipient)}</code>
              <button
                onClick={() => handleCopy(path.finalRecipient)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </button>
              <a
                href={getBlockExplorerUrl('address', path.finalRecipient)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Transaction</p>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-sm font-mono">{formatAddress(path.transactionHash)}</code>
              <a
                href={getBlockExplorerUrl('tx', path.transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Timestamp</p>
            <p className="text-sm font-medium mt-1">{formatTimestamp(path.timestamp)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="text-sm font-medium mt-1">
              {path.isCircular ? (
                <span className="text-yellow-600">Circular Transfer</span>
              ) : (
                <span className="text-green-600">Direct Transfer</span>
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Statistics</p>
            <p className="text-sm font-medium mt-1">
              {path.totalPaths} path{path.totalPaths > 1 ? 's' : ''} • {path.totalHops} hop{path.totalHops > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Paths */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Paths</h3>
        <div className="space-y-4">
          {paginatedPaths.map(([pathNumber, hops]) => (
            <div key={pathNumber} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Path {pathNumber + 1}
              </h4>
              <div className="space-y-2">
                {hops.map((hop, index) => (
                  <div key={hop.id} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <code className="font-mono text-xs">
                          {formatAddress(hop.from)}
                        </code>
                        <span className="text-gray-400">→</span>
                        <code className="font-mono text-xs">
                          {formatAddress(hop.to)}
                        </code>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{formatCRC(weiToCrc(hop.value))} CRC</span>
                        <span>Token: {formatAddress(hop.tokenAddress)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Received Amounts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Received Amounts</h3>
        <div className="space-y-2">
          {path.receivedTokenIds.map((tokenId, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-600">
                Token ID: {tokenId}
              </span>
              <span className="text-sm font-medium">
                {formatCRC(weiToCrc(path.receivedAmounts[index]))} CRC
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}