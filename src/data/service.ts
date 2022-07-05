import type {RaceEvent, HorseInRace} from './horse-event.js'
import {Race, Horse} from './models.js'
import log from '../log.js'

interface Cache {
	currentRace: any
	raceFinishing: boolean
}

const cache: Cache = {
	currentRace: null,
	raceFinishing: false,
}

async function getOrCreateHorse({id, name}: HorseInRace) {
	const horse = await Horse.findOne({id})
	if (horse) return horse

	return (await Horse.create([{id, name}]))[0]
}

export function clearCache() {
	cache.currentRace = null
	cache.raceFinishing = false
}

// This method tries to assemble race events into
// a race.
export async function processEvent(event: RaceEvent) {
	const horse = await getOrCreateHorse(event.horse)
	log.info({horse}, 'Found horse')

	const participant = {
		horse: horse,
		time: event.time,
	}

	// First time populating the cache
	if (cache.currentRace === null) {
		cache.currentRace = new Race({
			events: [],
			timestamp: Date.now(),
		})
	}

	// An active race has finished
	if (event.time === 0 && cache.raceFinishing) {
		log.info({timestamp: cache.currentRace.timestamp}, 'Race finished')
		cache.currentRace = new Race({
			events: [],
		})
		cache.raceFinishing = false
	}

	// An active race has started and a horse has passed
	// the finishing line
	if (event.time > 0 && !cache.raceFinishing) {
		cache.raceFinishing = true
	}
	cache.currentRace.events.push(participant)
	cache.currentRace = await cache.currentRace.save()

	log.info('Race saved')
}
