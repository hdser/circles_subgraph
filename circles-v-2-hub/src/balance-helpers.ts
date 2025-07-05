import { BigInt, Bytes, Address, store } from "@graphprotocol/graph-ts"
import { AccountBalance, Token } from "../generated/schema"

// Zero address constant
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export function createBalanceId(account: Bytes, tokenId: BigInt): string {
  return account.toHexString() + "-" + tokenId.toString()
}

export function updateBalance(
  account: Address,
  tokenId: BigInt,
  tokenAddress: Address,
  valueDelta: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt,
  transactionHash: Bytes
): void {
  // Skip zero address
  if (account.toHexString() == ZERO_ADDRESS) {
    return
  }

  let id = createBalanceId(account, tokenId)
  let balance = AccountBalance.load(id)

  if (balance == null) {
    balance = new AccountBalance(id)
    balance.account = account
    balance.tokenId = tokenId
    balance.tokenAddress = tokenAddress
    balance.balance = BigInt.fromI32(0)
  }

  // Update balance
  balance.balance = balance.balance.plus(valueDelta)
  balance.lastActivity = timestamp
  balance.blockNumber = blockNumber
  balance.transactionHash = transactionHash

  // Only save if balance is greater than 0
  if (balance.balance.gt(BigInt.fromI32(0))) {
    balance.save()
  } else if (balance.balance.equals(BigInt.fromI32(0))) {
    // Remove entity if balance is exactly 0
    // Note: In production, you might want to keep zero balances for historical tracking
    store.remove("AccountBalance", id)
  }
  // If balance is negative, we have an error condition - log it but don't save
}

export function ensureToken(tokenId: BigInt, tokenAddress: Address): void {
  let id = tokenId.toString()
  let token = Token.load(id)
  
  if (token == null) {
    token = new Token(id)
    token.tokenId = tokenId
    token.tokenAddress = tokenAddress
    token.save()
  }
}

export function handleSingleTransfer(
  from: Address,
  to: Address,
  tokenId: BigInt,
  value: BigInt,
  tokenAddress: Address,
  blockNumber: BigInt,
  timestamp: BigInt,
  transactionHash: Bytes
): void {
  // Ensure token exists
  ensureToken(tokenId, tokenAddress)

  // Update sender balance (decrease)
  if (from.toHexString() != ZERO_ADDRESS) {
    updateBalance(
      from,
      tokenId,
      tokenAddress,
      value.neg(), // negative value for outgoing
      blockNumber,
      timestamp,
      transactionHash
    )
  }

  // Update receiver balance (increase)
  if (to.toHexString() != ZERO_ADDRESS) {
    updateBalance(
      to,
      tokenId,
      tokenAddress,
      value, // positive value for incoming
      blockNumber,
      timestamp,
      transactionHash
    )
  }
}

export function handleBatchTransfer(
  from: Address,
  to: Address,
  tokenIds: BigInt[],
  values: BigInt[],
  tokenAddress: Address,
  blockNumber: BigInt,
  timestamp: BigInt,
  transactionHash: Bytes
): void {
  // Process each token transfer in the batch
  for (let i = 0; i < tokenIds.length; i++) {
    handleSingleTransfer(
      from,
      to,
      tokenIds[i],
      values[i],
      tokenAddress,
      blockNumber,
      timestamp,
      transactionHash
    )
  }
}