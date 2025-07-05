import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import { TokenTotalSupply } from "../generated/schema"
import { ZERO_ADDRESS } from "./balance-helpers"

export function updateTotalSupply(
  tokenId: BigInt,
  tokenAddress: Address,
  from: Address,
  to: Address,
  value: BigInt
): void {
  let id = tokenId.toString()
  let totalSupply = TokenTotalSupply.load(id)
  
  if (totalSupply == null) {
    totalSupply = new TokenTotalSupply(id)
    totalSupply.tokenId = tokenId
    totalSupply.tokenAddress = tokenAddress
    totalSupply.totalSupply = BigInt.fromI32(0)
  }
  
  // Minting: from zero address
  if (from.toHexString() == ZERO_ADDRESS) {
    totalSupply.totalSupply = totalSupply.totalSupply.plus(value)
  }
  
  // Burning: to zero address
  if (to.toHexString() == ZERO_ADDRESS) {
    totalSupply.totalSupply = totalSupply.totalSupply.minus(value)
  }
  
  totalSupply.save()
}