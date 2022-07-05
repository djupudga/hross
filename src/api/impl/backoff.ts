import {ServerBusyError} from '../errors.js'
import log from '../../log.js'
import {config} from '../../config.js'

export function backoff(wrapped: Function): Promise<void> {
	return new Promise((resolve, reject) => {
		wrapped()
			.then(resolve)
			.catch((e: Error) => {
				log.error({err: e}, 'Backoff got this error')
				if (e instanceof ServerBusyError) {
					log.info('Server busy, backing off')
					// The 'wait for auth server when it is busy' is
					// achieved by delay-throwing the ServerBusyError
					setTimeout(() => {
						reject(e)
					}, config.server.backoff)
				} else {
					reject(e)
				}
			})
	})
}
