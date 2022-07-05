// External data model of horce events

type StartOrFinish = 'start' | 'finish'

export interface HorseInRace {
	id: number
	name: string
}

export interface RaceEvent {
	event: StartOrFinish
	horse: HorseInRace
	time: number
}
