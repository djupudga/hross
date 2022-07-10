import {cleanDb, teardown, setup} from './fixture-setup'
// import {MongoWritable} from '../../src/data/mongo-writable'
import {processEvent, clearCache} from '../../src/data/service'
import {Race, Horse} from '../../src/data/models'

function createHorseEvent(
	id: number,
	name: string,
	event: string,
	time: number
): string {
	return JSON.stringify({
		horse: {id, name},
		event,
		time,
	})
}

function createStartEvents(count: number) {
	const evts: string[] = []
	for (let i = 0; i < count; i++) {
		evts.push(createHorseEvent(i, `horse-${i}`, 'start', 0))
	}
	return evts
}

function createEndEvents(count: number) {
	const evts: string[] = []
	for (let i = 0; i < count; i++) {
		const time = parseInt(`${Math.random() * 10000}`, 10)
		evts.push(createHorseEvent(i, `horse-${i}`, 'end', time))
	}
	return evts
}

async function createRace() {
	for (const evt of createStartEvents(6)) {
		await processEvent(JSON.parse(evt))
	}
	for (const evt of createEndEvents(6)) {
		await processEvent(JSON.parse(evt))
	}
}

beforeAll(async () => {
	await setup()
})

afterAll(async () => {
	await teardown()
})

describe('mongo integration tests', () => {
	describe('writable stream', () => {
		afterEach(async () => {
			await cleanDb()
			clearCache()
		})
		it('saves a race to the database', async () => {
			const evt = createHorseEvent(1, 'foo', 'start', 0)
			await processEvent(JSON.parse(evt))
			const count = await Race.count()
			expect(count).toEqual(1)
		})

		it('processes events into different races', async () => {
			// First race
			await createRace()
			// Second race
			await createRace()

			const raceCount = await Race.count()
			const horseCount = await Horse.count()

			expect(raceCount).toEqual(2)
			expect(horseCount).toEqual(6)
		})
	})
})
