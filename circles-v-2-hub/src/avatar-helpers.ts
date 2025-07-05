import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import { Avatar } from "../generated/schema"
import { Hub } from "../generated/Hub/Hub"

export function createOrUpdateAvatar(
  avatarAddress: Address,
  avatarType: string,
  blockNumber: BigInt,
  timestamp: BigInt,
  transactionIndex: BigInt,
  logIndex: BigInt,
  transactionHash: Bytes,
  invitedBy: Address | null,
  name: string | null,
  cidV0Digest: Bytes | null
): void {
  let id = avatarAddress.toHexString()
  let avatar = Avatar.load(id)
  
  if (avatar == null) {
    avatar = new Avatar(id)
    avatar.avatar = avatarAddress
    avatar.avatarType = avatarType
    avatar.blockNumber = blockNumber
    avatar.timestamp = timestamp
    avatar.transactionIndex = transactionIndex
    avatar.logIndex = logIndex
    avatar.transactionHash = transactionHash
    
    // For humans and groups, tokenId is the same as avatar address
    if (avatarType == "RegisterHuman" || avatarType == "RegisterGroup") {
      // Convert address to tokenId using the Hub contract's toTokenId function
      let hubContract = Hub.bind(Address.fromString("0xc12C1E50ABB450d6205Ea2C3Fa861b3B834d13e8"))
      let tokenIdResult = hubContract.try_toTokenId(avatarAddress)
      if (!tokenIdResult.reverted) {
        avatar.tokenId = tokenIdResult.value
      }
    }
  }
  
  // Update fields that can change
  if (invitedBy !== null) {
    avatar.invitedBy = invitedBy
  }
  
  if (name !== null) {
    avatar.name = name
  }
  
  if (cidV0Digest !== null) {
    avatar.cidV0Digest = cidV0Digest
  }
  
  avatar.save()
}

export function updateAvatarMetadata(
  avatarAddress: Address,
  cidV0Digest: Bytes
): void {
  let id = avatarAddress.toHexString()
  let avatar = Avatar.load(id)
  
  if (avatar !== null) {
    avatar.cidV0Digest = cidV0Digest
    avatar.save()
  }
}