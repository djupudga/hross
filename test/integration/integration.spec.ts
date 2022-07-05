import {cleanDb, teardown, setup, forThis} from './fixture-setup'
import {MongoWritable} from '../../src/data/mongo-writable'
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
		})
		it('saves a race to the database', (done) => {
			const stream = new MongoWritable()

			stream.once('drain', () => {
				Race.count()
					.then((count) => {
						expect(count).toEqual(1)
						done()
					})
					.catch(done)
			})

			const evt = createHorseEvent(1, 'foo', 'start', 0)
			stream.write(evt)
		})

		it('processes events into different races', async () => {
			const stream = new MongoWritable()

			// First race
			createStartEvents(6).forEach((evt) => stream.write(evt))
			createEndEvents(6).forEach((evt) => stream.write(evt))
			// Second race
			createStartEvents(6).forEach((evt) => stream.write(evt))
			createEndEvents(6).forEach((evt) => stream.write(evt))

			await forThis(200) // Hacky, mongo needs to "drain"
			const raceCount = await Race.count()
			const horseCount = await Horse.count()

			expect(raceCount).toEqual(2)
			expect(horseCount).toEqual(6)
		})
	})
})
