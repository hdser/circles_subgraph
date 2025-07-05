import { BigInt, Bytes, Address, log } from "@graphprotocol/graph-ts"
import { TransferPath, TransferHop, Transfer, Transaction } from "../generated/schema"
import { StreamCompleted as StreamCompletedEvent } from "../generated/Hub/Hub"

// Helper class for flow edges
class FlowEdge {
  from: Address
  to: Address
  tokenId: BigInt
  tokenAddress: Address
  flow: BigInt
  transferId: string
  transferType: string
  logIndex: BigInt
  batchIndex: i32
  used: BigInt

  constructor(
    from: Address,
    to: Address,
    tokenId: BigInt,
    tokenAddress: Address,
    flow: BigInt,
    transferId: string,
    transferType: string,
    logIndex: BigInt,
    batchIndex: i32
  ) {
    this.from = from
    this.to = to
    this.tokenId = tokenId
    this.tokenAddress = tokenAddress
    this.flow = flow
    this.transferId = transferId
    this.transferType = transferType
    this.logIndex = logIndex
    this.batchIndex = batchIndex
    this.used = BigInt.fromI32(0)
  }

  get edgeKey(): string {
    return this.from.toHexString() + "-" + this.to.toHexString() + "-" + this.tokenId.toString()
  }

  get availableFlow(): BigInt {
    return this.flow.minus(this.used)
  }
}

// Path representation
class Path {
  edges: FlowEdge[]
  flow: BigInt
  
  constructor() {
    this.edges = []
    this.flow = BigInt.fromI32(0)
  }
}

export function reconstructPathFromStreamCompleted(
  event: StreamCompletedEvent,
  streamCompletedId: string
): void {
  let pathId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  
  // Load all transfers from the same transaction
  let transfers = loadTransfersFromTransaction(
    event.transaction.hash,
    event.logIndex
  )
  
  if (transfers.length == 0) {
    log.warning("No transfers found for StreamCompleted in tx {}", [
      event.transaction.hash.toHexString()
    ])
    return
  }

  log.info("Reconstructing paths for {} transfers from {} to {}", [
    transfers.length.toString(),
    event.params.from.toHexString(),
    event.params.to.toHexString()
  ])

  let source = event.params.from
  let sink = event.params.to
  let isCircular = source.equals(sink)
  
  // Build flow network
  let flowNetwork = buildFlowNetwork(transfers, source, sink, isCircular)
  
  // Find all paths using flow decomposition
  let paths = findAllPaths(flowNetwork, source, sink, isCircular)
  
  if (paths.length == 0) {
    log.warning("No paths found for StreamCompleted", [])
    return
  }
  
  // Calculate total flow across all paths
  let totalFlow = BigInt.fromI32(0)
  for (let i = 0; i < paths.length; i++) {
    totalFlow = totalFlow.plus(paths[i].flow)
  }
  
  log.info("Found {} paths with total flow {}", [
    paths.length.toString(),
    totalFlow.toString()
  ])
  
  // Create TransferPath entity
  let transferPath = new TransferPath(pathId)
  transferPath.transactionHash = event.transaction.hash
  transferPath.streamCompletedId = streamCompletedId
  transferPath.originalSender = event.params.from
  transferPath.finalRecipient = event.params.to
  transferPath.isCircular = isCircular
  transferPath.totalHops = 0
  transferPath.totalPaths = paths.length
  transferPath.receivedTokenIds = event.params.ids
  transferPath.receivedAmounts = event.params.amounts
  transferPath.operator = event.params.operator
  transferPath.blockNumber = event.block.number
  transferPath.timestamp = event.block.timestamp
  transferPath.logIndex = event.logIndex
  
  // Count total hops across all paths
  for (let i = 0; i < paths.length; i++) {
    transferPath.totalHops += paths[i].edges.length
  }
  
  transferPath.save()
  
  // Create TransferHop entities for all edges in all paths
  let hopIndex = 0
  for (let i = 0; i < paths.length; i++) {
    let path = paths[i]
    for (let j = 0; j < path.edges.length; j++) {
      let edge = path.edges[j]
      let hopId = pathId + "-" + hopIndex.toString()
      
      let transferHop = new TransferHop(hopId)
      transferHop.path = pathId
      transferHop.hopIndex = hopIndex
      transferHop.from = edge.from
      transferHop.to = edge.to
      transferHop.tokenId = edge.tokenId
      transferHop.tokenAddress = edge.tokenAddress
      transferHop.value = path.flow // The flow amount for this path
      transferHop.transferType = edge.transferType
      transferHop.logIndex = edge.logIndex
      transferHop.batchIndex = edge.batchIndex
      transferHop.pathNumber = i // Track which path this hop belongs to
      transferHop.save()
      
      hopIndex++
    }
  }
}

function loadTransfersFromTransaction(
  txHash: Bytes,
  maxLogIndex: BigInt
): Transfer[] {
  let transfers: Transfer[] = []
  
  let transaction = Transaction.load(txHash.toHexString())
  if (transaction == null) {
    log.warning("Transaction entity not found for {}", [txHash.toHexString()])
    return transfers
  }
  
  for (let i = 0; i < transaction.transferIds.length; i++) {
    let transfer = Transfer.load(transaction.transferIds[i])
    if (transfer != null && transfer.logIndex.lt(maxLogIndex)) {
      transfers.push(transfer)
    }
  }
  
  // Sort by logIndex
  transfers.sort((a, b) => {
    let diff = a.logIndex.minus(b.logIndex).toI32()
    if (diff != 0) return diff
    return a.batchIndex - b.batchIndex
  })
  
  return transfers
}

function buildFlowNetwork(
  transfers: Transfer[],
  source: Address,
  sink: Address,
  isCircular: boolean
): Map<string, FlowEdge[]> {
  let network = new Map<string, FlowEdge[]>()
  let virtualSink = Address.fromString("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
  
  for (let i = 0; i < transfers.length; i++) {
    let transfer = transfers[i]
    let from = Address.fromBytes(transfer.from)
    let to = Address.fromBytes(transfer.to)
    
    // Handle circular transfers by using virtual sink
    if (isCircular && to.equals(sink)) {
      // Check if this is likely the final transfer to sink
      // (heuristic: it's in the latter half of transfers)
      if (i >= transfers.length / 2) {
        to = virtualSink
      }
    }
    
    let edge = new FlowEdge(
      from,
      to,
      transfer.tokenId,
      Address.fromBytes(transfer.tokenAddress),
      transfer.value,
      transfer.id,
      transfer.transferType,
      transfer.logIndex,
      transfer.batchIndex
    )
    
    let edgeKey = edge.edgeKey
    if (!network.has(edgeKey)) {
      network.set(edgeKey, [])
    }
    network.get(edgeKey).push(edge)
  }
  
  return network
}

function findAllPaths(
  network: Map<string, FlowEdge[]>,
  source: Address,
  sink: Address,
  isCircular: boolean
): Path[] {
  let paths: Path[] = []
  let effectiveSink = isCircular 
    ? Address.fromString("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
    : sink
  
  // Build adjacency list for BFS
  let adjacency = new Map<string, Map<string, FlowEdge[]>>()
  
  // Iterate through network keys manually
  let networkKeys = network.keys()
  for (let i = 0; i < networkKeys.length; i++) {
    let edgeKey = networkKeys[i]
    let edges = network.get(edgeKey)
    
    for (let j = 0; j < edges.length; j++) {
      let edge = edges[j]
      let fromKey = edge.from.toHexString()
      let toKey = edge.to.toHexString()
      
      if (!adjacency.has(fromKey)) {
        adjacency.set(fromKey, new Map<string, FlowEdge[]>())
      }
      
      let fromAdjacency = adjacency.get(fromKey)
      if (!fromAdjacency.has(toKey)) {
        fromAdjacency.set(toKey, [])
      }
      
      let edgeList = fromAdjacency.get(toKey)
      edgeList.push(edge)
    }
  }
  
  // Find paths using BFS with flow tracking
  let maxPaths = 100 // Safety limit
  
  while (paths.length < maxPaths) {
    let path = findSinglePath(adjacency, source, effectiveSink)
    if (path == null || path.flow.equals(BigInt.fromI32(0))) {
      break
    }
    
    // Update used flows
    for (let i = 0; i < path.edges.length; i++) {
      path.edges[i].used = path.edges[i].used.plus(path.flow)
    }
    
    // Convert virtual sink back to real sink
    if (isCircular) {
      for (let i = 0; i < path.edges.length; i++) {
        if (path.edges[i].to.equals(effectiveSink)) {
          path.edges[i].to = sink
        }
      }
    }
    
    paths.push(path)
  }
  
  return paths
}

function findSinglePath(
  adjacency: Map<string, Map<string, FlowEdge[]>>,
  source: Address,
  sink: Address
): Path | null {
  // BFS to find a path with available flow
  let parent = new Map<string, string>()
  let edgeUsed = new Map<string, FlowEdge>()
  let visited = new Set<string>()
  let queue: string[] = [source.toHexString()]
  
  visited.add(source.toHexString())
  
  while (queue.length > 0) {
    let current = queue.shift() as string
    
    if (current == sink.toHexString()) {
      // Found path, reconstruct it
      let path = new Path()
      
      // First, trace back the path to collect all edges
      let node = sink.toHexString()
      let edges: FlowEdge[] = []
      
      while (parent.has(node)) {
        let prevNode = parent.get(node)
        let edge = edgeUsed.get(node)
        edges.unshift(edge)
        node = prevNode
      }
      
      // If no edges, return null
      if (edges.length == 0) {
        return null
      }
      
      // Find the minimum flow along the path
      let minFlow = edges[0].availableFlow
      for (let i = 1; i < edges.length; i++) {
        if (edges[i].availableFlow.lt(minFlow)) {
          minFlow = edges[i].availableFlow
        }
      }
      
      if (minFlow.gt(BigInt.fromI32(0))) {
        path.edges = edges
        path.flow = minFlow
        return path
      }
      return null
    }
    
    // Explore neighbors
    if (adjacency.has(current)) {
      let neighbors = adjacency.get(current)
      let neighborKeys = neighbors.keys()
      
      for (let i = 0; i < neighborKeys.length; i++) {
        let neighbor = neighborKeys[i]
        if (!visited.has(neighbor)) {
          let edges = neighbors.get(neighbor)
          
          // Find an edge with available flow
          for (let j = 0; j < edges.length; j++) {
            if (edges[j].availableFlow.gt(BigInt.fromI32(0))) {
              visited.add(neighbor)
              parent.set(neighbor, current)
              edgeUsed.set(neighbor, edges[j])
              queue.push(neighbor)
              break
            }
          }
        }
      }
    }
  }
  
  return null
}