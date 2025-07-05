import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
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
  URI
} from "../generated/Hub/Hub"

export function createApprovalForAllEvent(
  account: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createDiscountCostEvent(
  account: Address,
  id: BigInt,
  discountCost: BigInt
): DiscountCost {
  let discountCostEvent = changetype<DiscountCost>(newMockEvent())

  discountCostEvent.parameters = new Array()

  discountCostEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  discountCostEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  discountCostEvent.parameters.push(
    new ethereum.EventParam(
      "discountCost",
      ethereum.Value.fromUnsignedBigInt(discountCost)
    )
  )

  return discountCostEvent
}

export function createFlowEdgesScopeLastEndedEvent(): FlowEdgesScopeLastEnded {
  let flowEdgesScopeLastEndedEvent =
    changetype<FlowEdgesScopeLastEnded>(newMockEvent())

  flowEdgesScopeLastEndedEvent.parameters = new Array()

  return flowEdgesScopeLastEndedEvent
}

export function createFlowEdgesScopeSingleStartedEvent(
  flowEdgeId: BigInt,
  streamId: i32
): FlowEdgesScopeSingleStarted {
  let flowEdgesScopeSingleStartedEvent =
    changetype<FlowEdgesScopeSingleStarted>(newMockEvent())

  flowEdgesScopeSingleStartedEvent.parameters = new Array()

  flowEdgesScopeSingleStartedEvent.parameters.push(
    new ethereum.EventParam(
      "flowEdgeId",
      ethereum.Value.fromUnsignedBigInt(flowEdgeId)
    )
  )
  flowEdgesScopeSingleStartedEvent.parameters.push(
    new ethereum.EventParam(
      "streamId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(streamId))
    )
  )

  return flowEdgesScopeSingleStartedEvent
}

export function createGroupMintEvent(
  sender: Address,
  receiver: Address,
  group: Address,
  collateral: Array<BigInt>,
  amounts: Array<BigInt>
): GroupMint {
  let groupMintEvent = changetype<GroupMint>(newMockEvent())

  groupMintEvent.parameters = new Array()

  groupMintEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  groupMintEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  groupMintEvent.parameters.push(
    new ethereum.EventParam("group", ethereum.Value.fromAddress(group))
  )
  groupMintEvent.parameters.push(
    new ethereum.EventParam(
      "collateral",
      ethereum.Value.fromUnsignedBigIntArray(collateral)
    )
  )
  groupMintEvent.parameters.push(
    new ethereum.EventParam(
      "amounts",
      ethereum.Value.fromUnsignedBigIntArray(amounts)
    )
  )

  return groupMintEvent
}

export function createPersonalMintEvent(
  human: Address,
  amount: BigInt,
  startPeriod: BigInt,
  endPeriod: BigInt
): PersonalMint {
  let personalMintEvent = changetype<PersonalMint>(newMockEvent())

  personalMintEvent.parameters = new Array()

  personalMintEvent.parameters.push(
    new ethereum.EventParam("human", ethereum.Value.fromAddress(human))
  )
  personalMintEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  personalMintEvent.parameters.push(
    new ethereum.EventParam(
      "startPeriod",
      ethereum.Value.fromUnsignedBigInt(startPeriod)
    )
  )
  personalMintEvent.parameters.push(
    new ethereum.EventParam(
      "endPeriod",
      ethereum.Value.fromUnsignedBigInt(endPeriod)
    )
  )

  return personalMintEvent
}

export function createRegisterGroupEvent(
  group: Address,
  mint: Address,
  treasury: Address,
  name: string,
  symbol: string
): RegisterGroup {
  let registerGroupEvent = changetype<RegisterGroup>(newMockEvent())

  registerGroupEvent.parameters = new Array()

  registerGroupEvent.parameters.push(
    new ethereum.EventParam("group", ethereum.Value.fromAddress(group))
  )
  registerGroupEvent.parameters.push(
    new ethereum.EventParam("mint", ethereum.Value.fromAddress(mint))
  )
  registerGroupEvent.parameters.push(
    new ethereum.EventParam("treasury", ethereum.Value.fromAddress(treasury))
  )
  registerGroupEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  registerGroupEvent.parameters.push(
    new ethereum.EventParam("symbol", ethereum.Value.fromString(symbol))
  )

  return registerGroupEvent
}

export function createRegisterHumanEvent(
  avatar: Address,
  inviter: Address
): RegisterHuman {
  let registerHumanEvent = changetype<RegisterHuman>(newMockEvent())

  registerHumanEvent.parameters = new Array()

  registerHumanEvent.parameters.push(
    new ethereum.EventParam("avatar", ethereum.Value.fromAddress(avatar))
  )
  registerHumanEvent.parameters.push(
    new ethereum.EventParam("inviter", ethereum.Value.fromAddress(inviter))
  )

  return registerHumanEvent
}

export function createRegisterOrganizationEvent(
  organization: Address,
  name: string
): RegisterOrganization {
  let registerOrganizationEvent =
    changetype<RegisterOrganization>(newMockEvent())

  registerOrganizationEvent.parameters = new Array()

  registerOrganizationEvent.parameters.push(
    new ethereum.EventParam(
      "organization",
      ethereum.Value.fromAddress(organization)
    )
  )
  registerOrganizationEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return registerOrganizationEvent
}

export function createSetAdvancedUsageFlagEvent(
  avatar: Address,
  flag: Bytes
): SetAdvancedUsageFlag {
  let setAdvancedUsageFlagEvent =
    changetype<SetAdvancedUsageFlag>(newMockEvent())

  setAdvancedUsageFlagEvent.parameters = new Array()

  setAdvancedUsageFlagEvent.parameters.push(
    new ethereum.EventParam("avatar", ethereum.Value.fromAddress(avatar))
  )
  setAdvancedUsageFlagEvent.parameters.push(
    new ethereum.EventParam("flag", ethereum.Value.fromFixedBytes(flag))
  )

  return setAdvancedUsageFlagEvent
}

export function createStoppedEvent(avatar: Address): Stopped {
  let stoppedEvent = changetype<Stopped>(newMockEvent())

  stoppedEvent.parameters = new Array()

  stoppedEvent.parameters.push(
    new ethereum.EventParam("avatar", ethereum.Value.fromAddress(avatar))
  )

  return stoppedEvent
}

export function createStreamCompletedEvent(
  operator: Address,
  from: Address,
  to: Address,
  ids: Array<BigInt>,
  amounts: Array<BigInt>
): StreamCompleted {
  let streamCompletedEvent = changetype<StreamCompleted>(newMockEvent())

  streamCompletedEvent.parameters = new Array()

  streamCompletedEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  streamCompletedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  streamCompletedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  streamCompletedEvent.parameters.push(
    new ethereum.EventParam("ids", ethereum.Value.fromUnsignedBigIntArray(ids))
  )
  streamCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "amounts",
      ethereum.Value.fromUnsignedBigIntArray(amounts)
    )
  )

  return streamCompletedEvent
}

export function createTransferBatchEvent(
  operator: Address,
  from: Address,
  to: Address,
  ids: Array<BigInt>,
  values: Array<BigInt>
): TransferBatch {
  let transferBatchEvent = changetype<TransferBatch>(newMockEvent())

  transferBatchEvent.parameters = new Array()

  transferBatchEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("ids", ethereum.Value.fromUnsignedBigIntArray(ids))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam(
      "values",
      ethereum.Value.fromUnsignedBigIntArray(values)
    )
  )

  return transferBatchEvent
}

export function createTransferSingleEvent(
  operator: Address,
  from: Address,
  to: Address,
  id: BigInt,
  value: BigInt
): TransferSingle {
  let transferSingleEvent = changetype<TransferSingle>(newMockEvent())

  transferSingleEvent.parameters = new Array()

  transferSingleEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferSingleEvent
}

export function createTrustEvent(
  truster: Address,
  trustee: Address,
  expiryTime: BigInt
): Trust {
  let trustEvent = changetype<Trust>(newMockEvent())

  trustEvent.parameters = new Array()

  trustEvent.parameters.push(
    new ethereum.EventParam("truster", ethereum.Value.fromAddress(truster))
  )
  trustEvent.parameters.push(
    new ethereum.EventParam("trustee", ethereum.Value.fromAddress(trustee))
  )
  trustEvent.parameters.push(
    new ethereum.EventParam(
      "expiryTime",
      ethereum.Value.fromUnsignedBigInt(expiryTime)
    )
  )

  return trustEvent
}

export function createURIEvent(value: string, id: BigInt): URI {
  let uriEvent = changetype<URI>(newMockEvent())

  uriEvent.parameters = new Array()

  uriEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromString(value))
  )
  uriEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return uriEvent
}
