import type {RequestFn, RequestOptions} from '../request-fn.js'

export function createPoller(request: RequestFn) {
	return async function poller(options: RequestOptions) {
		while (true) {
			await request(options)
		}
	}
}
