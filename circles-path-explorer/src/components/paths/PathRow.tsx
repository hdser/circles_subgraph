import React from 'react';
import { TransferPath } from '../../utils/types';
import { formatAddress, formatRelativeTime } from '../../utils/formatters';
import { ArrowRight, ArrowLeft, RotateCw, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getBlockExplorerUrl } from '../../utils/helpers';
import clsx from 'clsx';
import ExpandedPathView from './ExpandedPathView';

interface PathRowProps {
  path: TransferPath;
  role: 'sender' | 'recipient';
  onSelect: () => void;
  isSelected: boolean;
}

export default function PathRow({ path, role, onSelect, isSelected }: PathRowProps) {
  const counterparty = role === 'sender' ? path.finalRecipient : path.originalSender;

  return (
    <React.Fragment>
      <tr 
        className={clsx(
          'hover:bg-gray-50 transition-colors cursor-pointer',
          isSelected && 'bg-circles-light'
        )}
        onClick={onSelect}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {role === 'sender' ? (
              <ArrowRight className="h-4 w-4 text-circles-purple mr-2" />
            ) : (
              <ArrowLeft className="h-4 w-4 text-circles-green mr-2" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {role === 'sender' ? 'Sender' : 'Recipient'}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <code className="text-sm font-mono text-gray-900">
            {formatAddress(counterparty)}
          </code>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          {path.isCircular ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <RotateCw className="h-3 w-3 mr-1" />
              Circular
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Direct
            </span>
          )}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {path.totalHops}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatRelativeTime(path.timestamp)}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <code className="text-xs font-mono text-gray-500">
              {formatAddress(path.transactionHash)}
            </code>
            <a
              href={getBlockExplorerUrl('tx', path.transactionHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            className="text-circles-purple hover:text-purple-700 inline-flex items-center space-x-1"
          >
            {isSelected ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span>{isSelected ? 'Hide' : 'View'}</span>
          </button>
        </td>
      </tr>
      {isSelected && (
        <tr className="bg-white">
          <td colSpan={7} className="p-0 border-t-2 border-circles-purple">
            <ExpandedPathView path={path} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}