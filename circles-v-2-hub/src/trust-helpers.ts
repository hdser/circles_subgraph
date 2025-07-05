import { BigInt, Bytes, Address, store } from "@graphprotocol/graph-ts"
import { TrustRelation } from "../generated/schema"

export function createTrustId(truster: Address, trustee: Address): string {
  return truster.toHexString() + "-" + trustee.toHexString()
}

export function updateTrustRelation(
  truster: Address,
  trustee: Address,
  expiryTime: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt,
  transactionIndex: BigInt,
  logIndex: BigInt,
  transactionHash: Bytes
): void {
  let id = createTrustId(truster, trustee)
  let trust = TrustRelation.load(id)
  
  // If expiry time is in the past (relative to block timestamp), remove the trust
  if (expiryTime.le(timestamp)) {
    if (trust !== null) {
      store.remove("TrustRelation", id)
    }
    return
  }
  
  // Create or update trust relation
  if (trust == null) {
    trust = new TrustRelation(id)
    trust.truster = truster
    trust.trustee = trustee
  }
  
  // Update with latest values
  trust.blockNumber = blockNumber
  trust.timestamp = timestamp
  trust.transactionIndex = transactionIndex
  trust.logIndex = logIndex
  trust.transactionHash = transactionHash
  trust.expiryTime = expiryTime
  
  trust.save()
}