import { TransferPath } from '../../utils/types';
import PathRow from './PathRow';

interface PathTableProps {
  paths: Array<TransferPath & { role: 'sender' | 'recipient' }>;
  onSelectPath: (path: TransferPath) => void;
  selectedPathId?: string;
}

export default function PathTable({ paths, onSelectPath, selectedPathId }: PathTableProps) {
  if (paths.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No transfer paths found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Counterparty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hops
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paths.map((path) => (
            <PathRow
              key={path.id}
              path={path}
              role={path.role}
              onSelect={() => onSelectPath(path)}
              isSelected={selectedPathId === path.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}