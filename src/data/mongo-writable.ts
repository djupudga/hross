import {Writable} from 'node:stream'
import type {RaceEvent} from './horse-event.js'
import {processEvent, clearCache} from './service.js'
import log from '../log.js'

// This writable stream deserializes race events
// and pushes them to the main datastore service.
export class MongoWritable extends Writable {
	constructor() {
		super()
		clearCache()
	}

	override _write(
		chunk: any,
		_encoding: string,
		next: (error?: Error) => void
	) {
		try {
			const event = JSON.parse(chunk) as RaceEvent
			log.info({event}, 'Writable got message, processing')
			processEvent(event)
				.then(() => {
					next()
					this.emit('drain')
				})
				.catch((err) => next(err))
		} catch (err: any) {
			next(err)
		}
	}
}
