import { TransferPath, TransferHop, SankeyNode, SankeyLink, Avatar } from '../../utils/types';
import { weiToCrc } from '../../utils/formatters';
import { getTokenColor } from './colorScheme';
import { AVATAR_TYPE_COLORS } from '../../utils/constants';

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export const transformPathToSankey = (
  path: TransferPath,
  avatarMap: Map<string, Avatar>
): SankeyData => {
  const nodes = new Map<string, SankeyNode>();
  const links: SankeyLink[] = [];

  // Group hops by path number
  const hopsByPath = new Map<number, TransferHop[]>();
  path.transferHops.forEach(hop => {
    if (!hopsByPath.has(hop.pathNumber)) {
      hopsByPath.set(hop.pathNumber, []);
    }
    hopsByPath.get(hop.pathNumber)!.push(hop);
  });

  // Process each path
  hopsByPath.forEach((hops, pathNumber) => {
    // Sort hops by index
    hops.sort((a, b) => a.hopIndex - b.hopIndex);

    hops.forEach((hop, index) => {
      // Create unique node keys
      const fromKey = createNodeKey(hop.from, pathNumber, index);
      const toKey = createNodeKey(hop.to, pathNumber, index + 1);

      // Add nodes using the unique keys
      if (!nodes.has(fromKey)) {
        nodes.set(fromKey, createNode(hop.from, avatarMap, path.originalSender, undefined, fromKey));
      }

      if (!nodes.has(toKey)) {
        nodes.set(toKey, createNode(hop.to, avatarMap, path.originalSender, path.finalRecipient, toKey));
      }

      // Add link
      links.push({
        source: fromKey,
        target: toKey,
        value: weiToCrc(hop.value),
        tokenId: hop.tokenId,
        tokenOwner: hop.tokenAddress,
        lineStyle: {
          color: getTokenColor(hop.tokenAddress),
          opacity: 0.6,
          curveness: 0.5
        }
      });
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    links
  };
};

// Create unique node key for circular paths
function createNodeKey(address: string, pathNumber: number, position: number): string {
  // For non-circular paths or first/last nodes, use simple address to avoid unnecessary complexity
  if (position === 0) return address.toLowerCase();
  
  // For intermediate nodes in potential circular paths, append position to make them unique
  return `${address.toLowerCase()}_${pathNumber}_${position}`;
}

function createNode(
  address: string,
  avatarMap: Map<string, Avatar>,
  originalSender?: string,
  finalRecipient?: string,
  nodeKey?: string
): SankeyNode {
  const avatar = avatarMap.get(address.toLowerCase());
  const isSource = address.toLowerCase() === originalSender?.toLowerCase();
  const isTarget = address.toLowerCase() === finalRecipient?.toLowerCase();

  let color = '#94A3B8'; // Default gray
  if (isSource) {
    color = '#7B3FF2'; // Purple for source
  } else if (isTarget) {
    color = '#10B981'; // Green for target
  } else if (avatar) {
    color = AVATAR_TYPE_COLORS[avatar.avatarType] || color;
  }

  return {
    name: nodeKey || address.toLowerCase(), // Use the unique key as the name
    label: avatar?.name || undefined,
    avatarType: avatar?.avatarType,
    itemStyle: {
      color
    }
  };
}

export const aggregateTransfersByPath = (transferHops: TransferHop[]): Map<number, TransferHop[]> => {
  const pathMap = new Map<number, TransferHop[]>();
  
  transferHops.forEach(hop => {
    if (!pathMap.has(hop.pathNumber)) {
      pathMap.set(hop.pathNumber, []);
    }
    pathMap.get(hop.pathNumber)!.push(hop);
  });

  // Sort hops within each path
  pathMap.forEach(hops => {
    hops.sort((a, b) => a.hopIndex - b.hopIndex);
  });

  return pathMap;
};