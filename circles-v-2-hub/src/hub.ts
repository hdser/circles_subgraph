import {
  ApprovalForAll as ApprovalForAllEvent,
  DiscountCost as DiscountCostEvent,
  FlowEdgesScopeLastEnded as FlowEdgesScopeLastEndedEvent,
  FlowEdgesScopeSingleStarted as FlowEdgesScopeSingleStartedEvent,
  GroupMint as GroupMintEvent,
  PersonalMint as PersonalMintEvent,
  RegisterGroup as RegisterGroupEvent,
  RegisterHuman as RegisterHumanEvent,
  RegisterOrganization as RegisterOrganizationEvent,
  SetAdvancedUsageFlag as SetAdvancedUsageFlagEvent,
  Stopped as StoppedEvent,
  StreamCompleted as StreamCompletedEvent,
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent,
  Trust as TrustEvent,
  URI as URIEvent,
  Hub
} from "../generated/Hub/Hub"
import {
  ApprovalForAll,
  DiscountCost,
  FlowEdgesScopeLastEnded,
  FlowEdgesScopeSingleStarted,
  GroupMint,
  PersonalMint,
  RegisterGroup,
  RegisterHuman,
  RegisterOrganization,
  SetAdvancedUsageFlag,
  Stopped,
  StreamCompleted,
  TransferBatch,
  TransferSingle,
  Trust,
  URI,
  Transaction
} from "../generated/schema"
import { handleSingleTransfer, handleBatchTransfer } from "./balance-helpers"
import { createOrUpdateAvatar } from "./avatar-helpers"
import { updateTrustRelation } from "./trust-helpers"
import { createTransfer } from "./transfer-helpers"
import { updateTotalSupply } from "./total-supply-helpers"
import { reconstructPathFromStreamCompleted } from "./path-reconstruction"
import { Address, ethereum, log } from "@graphprotocol/graph-ts"

function ensureTransaction(event: ethereum.Event): Transaction {
  let txId = event.transaction.hash.toHexString()
  let transaction = Transaction.load(txId)
  
  if (transaction == null) {
    transaction = new Transaction(txId)
    transaction.blockNumber = event.block.number
    transaction.timestamp = event.block.timestamp
    transaction.transferIds = []
    transaction.streamCompletedIds = []
    transaction.hasBeenProcessed = false
    transaction.save()
  }
  
  return transaction as Transaction
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDiscountCost(event: DiscountCostEvent): void {
  let entity = new DiscountCost(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account
  entity.internal_id = event.params.id
  entity.discountCost = event.params.discountCost

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlowEdgesScopeLastEnded(
  event: FlowEdgesScopeLastEndedEvent
): void {
  let entity = new FlowEdgesScopeLastEnded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlowEdgesScopeSingleStarted(
  event: FlowEdgesScopeSingleStartedEvent
): void {
  let entity = new FlowEdgesScopeSingleStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.flowEdgeId = event.params.flowEdgeId
  entity.streamId = event.params.streamId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGroupMint(event: GroupMintEvent): void {
  let entity = new GroupMint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.receiver = event.params.receiver
  entity.group = event.params.group
  entity.collateral = event.params.collateral
  entity.amounts = event.params.amounts

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePersonalMint(event: PersonalMintEvent): void {
  let entity = new PersonalMint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.human = event.params.human
  entity.amount = event.params.amount
  entity.startPeriod = event.params.startPeriod
  entity.endPeriod = event.params.endPeriod

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRegisterGroup(event: RegisterGroupEvent): void {
  let entity = new RegisterGroup(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.group = event.params.group
  entity.mint = event.params.mint
  entity.treasury = event.params.treasury
  entity.name = event.params.name
  entity.symbol = event.params.symbol

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create/update Avatar entity
  createOrUpdateAvatar(
    event.params.group,
    "RegisterGroup",
    event.block.number,
    event.block.timestamp,
    event.transaction.index,
    event.logIndex,
    event.transaction.hash,
    null,
    event.params.name,
    null
  )
}

export function handleRegisterHuman(event: RegisterHumanEvent): void {
  let entity = new RegisterHuman(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.avatar = event.params.avatar
  entity.inviter = event.params.inviter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create/update Avatar entity
  createOrUpdateAvatar(
    event.params.avatar,
    "RegisterHuman",
    event.block.number,
    event.block.timestamp,
    event.transaction.index,
    event.logIndex,
    event.transaction.hash,
    event.params.inviter,
    null,
    null
  )
}

export function handleRegisterOrganization(
  event: RegisterOrganizationEvent
): void {
  let entity = new RegisterOrganization(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.organization = event.params.organization
  entity.name = event.params.name

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Create/update Avatar entity
  createOrUpdateAvatar(
    event.params.organization,
    "RegisterOrganization",
    event.block.number,
    event.block.timestamp,
    event.transaction.index,
    event.logIndex,
    event.transaction.hash,
    null,
    event.params.name,
    null
  )
}

export function handleSetAdvancedUsageFlag(
  event: SetAdvancedUsageFlagEvent
): void {
  let entity = new SetAdvancedUsageFlag(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.avatar = event.params.avatar
  entity.flag = event.params.flag

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStopped(event: StoppedEvent): void {
  let entity = new Stopped(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.avatar = event.params.avatar

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStreamCompleted(event: StreamCompletedEvent): void {
  let entityId = event.transaction.hash.concatI32(event.logIndex.toI32())
  let entity = new StreamCompleted(entityId)
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.ids = event.params.ids
  entity.amounts = event.params.amounts

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update transaction entity
  let transaction = ensureTransaction(event)
  let streamCompletedIds = transaction.streamCompletedIds
  streamCompletedIds.push(entityId.toHexString())
  transaction.streamCompletedIds = streamCompletedIds
  transaction.save()

  // Reconstruct transfer path
  reconstructPathFromStreamCompleted(event, entityId.toHexString())
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  let entity = new TransferBatch(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.ids = event.params.ids
  entity.values = event.params.values

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update balances
  handleBatchTransfer(
    event.params.from,
    event.params.to,
    event.params.ids,
    event.params.values,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  )

  // Create Transfer entities and update total supply for each item in batch
  for (let i = 0; i < event.params.ids.length; i++) {
    let transferId = createTransfer(
      event.block.number,
      event.block.timestamp,
      event.transaction.index,
      event.logIndex,
      i,
      event.transaction.hash,
      event.params.operator,
      event.params.from,
      event.params.to,
      event.params.ids[i],
      event.params.values[i],
      "TransferBatch",
      event.address
    )

    // Track transfer in transaction entity
    let transaction = ensureTransaction(event)
    let transferIds = transaction.transferIds
    transferIds.push(transferId)
    transaction.transferIds = transferIds
    transaction.save()

    updateTotalSupply(
      event.params.ids[i],
      event.address,
      event.params.from,
      event.params.to,
      event.params.values[i]
    )
  }
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  let entity = new TransferSingle(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.internal_id = event.params.id
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update balances
  handleSingleTransfer(
    event.params.from,
    event.params.to,
    event.params.id,
    event.params.value,
    event.address,
    event.block.number,
    event.block.timestamp,
    event.transaction.hash
  )

  // Create Transfer entity
  let transferId = createTransfer(
    event.block.number,
    event.block.timestamp,
    event.transaction.index,
    event.logIndex,
    0,
    event.transaction.hash,
    event.params.operator,
    event.params.from,
    event.params.to,
    event.params.id,
    event.params.value,
    "TransferSingle",
    event.address
  )

  // Track transfer in transaction entity
  let transaction = ensureTransaction(event)
  let transferIds = transaction.transferIds
  transferIds.push(transferId)
  transaction.transferIds = transferIds
  transaction.save()

  // Log for debugging
  log.info("TransferSingle: {} -> {} in tx {} at logIndex {}", [
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.transaction.hash.toHexString(),
    event.logIndex.toString()
  ])

  // Update total supply
  updateTotalSupply(
    event.params.id,
    event.address,
    event.params.from,
    event.params.to,
    event.params.value
  )
}

export function handleTrust(event: TrustEvent): void {
  let entity = new Trust(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.truster = event.params.truster
  entity.trustee = event.params.trustee
  entity.expiryTime = event.params.expiryTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update TrustRelation entity
  updateTrustRelation(
    event.params.truster,
    event.params.trustee,
    event.params.expiryTime,
    event.block.number,
    event.block.timestamp,
    event.transaction.index,
    event.logIndex,
    event.transaction.hash
  )
}

export function handleURI(event: URIEvent): void {
  let entity = new URI(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.value = event.params.value
  entity.internal_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}