import { Delegation, Proposal } from "../generated/schema"
import { Delegated, Governance, ProposalCreated, ProposalExecuted, Undelegated, Voted } from "../generated/governance/Governance"
import { Address, BigInt, Value } from "@graphprotocol/graph-ts"
import { store } from '@graphprotocol/graph-ts'

const governance = Governance.bind(Address.fromString("0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce"))

export function handleProposalCreated(event: ProposalCreated): void {
	const proposal = new Proposal(event.params.id.toHexString())

	proposal.proposer = event.params.proposer
	proposal.target = event.params.target
	proposal.startTime = event.params.startTime
	proposal.endTime = event.params.endTime
	proposal.description = event.params.description
	proposal.forVotes = BigInt.zero()
	proposal.againstVotes = BigInt.zero()
	proposal.executed = false
	proposal.extended = false

	proposal.save()
}

export function handleVoted(event: Voted): void {
	const proposal = Proposal.load(event.params.proposalId.toHexString())
	if (!proposal) return

	const xproposal = governance.proposals(event.params.proposalId)
	// const proposer = xproposal.value0
	// const target = xproposal.value1
	// const startTime = xproposal.value2
	const endTime = xproposal.value3
	const forVotes = xproposal.value4
	const againstVotes = xproposal.value5
	// const executed = xproposal.value6
	const extended = xproposal.value7

	proposal.forVotes = forVotes
	proposal.againstVotes = againstVotes
	proposal.endTime = endTime
	proposal.extended = extended

	proposal.save()
}

export function handleProposalExecuted(event: ProposalExecuted): void {
	const proposal = Proposal.load(event.params.proposalId.toHexString())
	if (!proposal) return

	proposal.executed = true

	proposal.save()
}

export function handleDelegated(event: Delegated): void {
	let delegation = Delegation.load(event.params.account.toHexString())
	if (!delegation) delegation = new Delegation(event.params.account.toHexString())

	delegation.delegator = event.params.account
	delegation.delegatee = event.params.to

	delegation.save()
}

export function handleUndelegated(event: Undelegated): void {
	const delegation = Delegation.load(event.params.account.toHexString())
	if (!delegation) return

	store.remove("Delegation", delegation.id)
}