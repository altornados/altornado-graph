import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Day } from "../generated/schema"
import { StakeBurned } from "../generated/relayer-registry/RelayerRegistry"
import { TORN } from "../generated/relayer-registry/TORN"

const torn = TORN.bind(Address.fromString("0x77777FeDdddFfC19Ff86DB637967013e6C6A116C"))

export function handleStakeBurned(event: StakeBurned): void {
	const dday = BigInt.fromI32(60 * 60 * 24)
	const bday = event.block.timestamp.div(dday)

	let day = Day.load(bday.toString())

	if (!day)  {
		day = new Day(bday.toString())
		day.amountBurned = BigInt.zero()
	}

	day.amountBurned = day.amountBurned.plus(event.params.amountBurned)
	day.vaultBalance = torn.balanceOf(Address.fromString("0x2F50508a8a3D323B91336FA3eA6ae50E55f32185"))

	day.save()
}
