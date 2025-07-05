import { TransferPath } from '../../utils/types';
import { ArrowRight, ArrowLeft, RotateCw, GitBranch } from 'lucide-react';

interface PathStatsProps {
  paths: Array<TransferPath & { role: 'sender' | 'recipient' }>;
  address: string;
}

export default function PathStats({ paths, address }: PathStatsProps) {
  const stats = paths.reduce(
    (acc, path) => {
      if (path.role === 'sender') {
        acc.sentCount++;
      } else {
        acc.receivedCount++;
      }
      
      if (path.isCircular) {
        acc.circularCount++;
      }
      
      acc.totalHops += path.totalHops;
      acc.maxHops = Math.max(acc.maxHops, path.totalHops);
      
      return acc;
    },
    {
      sentCount: 0,
      receivedCount: 0,
      circularCount: 0,
      totalHops: 0,
      maxHops: 0,
    }
  );

  const avgHops = paths.length > 0 ? (stats.totalHops / paths.length).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Sent</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.sentCount}</p>
          </div>
          <ArrowRight className="h-8 w-8 text-circles-purple opacity-20" />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Received</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.receivedCount}</p>
          </div>
          <ArrowLeft className="h-8 w-8 text-circles-green opacity-20" />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Circular</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.circularCount}</p>
          </div>
          <RotateCw className="h-8 w-8 text-yellow-500 opacity-20" />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Avg Hops</p>
            <p className="text-2xl font-semibold text-gray-900">{avgHops}</p>
          </div>
          <GitBranch className="h-8 w-8 text-gray-400 opacity-20" />
        </div>
      </div>
    </div>
  );
}