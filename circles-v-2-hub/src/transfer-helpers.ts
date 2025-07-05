import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import { Transfer, Transaction } from "../generated/schema"

export function createTransferId(
  transactionHash: Bytes,
  logIndex: BigInt,
  batchIndex: i32
): string {
  return transactionHash.toHexString() + "-" + logIndex.toString() + "-" + batchIndex.toString()
}

export function createTransfer(
  blockNumber: BigInt,
  timestamp: BigInt,
  transactionIndex: BigInt,
  logIndex: BigInt,
  batchIndex: i32,
  transactionHash: Bytes,
  operator: Address | null,
  from: Address,
  to: Address,
  tokenId: BigInt,
  value: BigInt,
  transferType: string,
  tokenAddress: Address
): string {
  let id = createTransferId(transactionHash, logIndex, batchIndex)
  let transfer = new Transfer(id)
  
  transfer.blockNumber = blockNumber
  transfer.timestamp = timestamp
  transfer.transactionIndex = transactionIndex
  transfer.logIndex = logIndex
  transfer.batchIndex = batchIndex
  transfer.transactionHash = transactionHash
  
  if (operator !== null) {
    transfer.operator = operator
  }
  
  transfer.from = from
  transfer.to = to
  transfer.tokenId = tokenId
  transfer.value = value
  transfer.transferType = transferType
  transfer.tokenAddress = tokenAddress
  
  // Calculate event index by looking at existing transfers in this transaction
  let transaction = Transaction.load(transactionHash.toHexString())
  transfer.eventIndex = transaction ? transaction.transferIds.length : 0
  
  transfer.save()
  
  return id
}