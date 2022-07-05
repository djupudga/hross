import type {Readable} from 'node:stream'
import log from '../../log.js'
import {InvalidSessionError} from '../errors.js'
import type {HttpGetFn} from '../http.js'
import type {RequestFn, RequestOptions} from '../request-fn.js'

export function createRequestFunction(
	stream: Readable,
	get: HttpGetFn
): RequestFn {
	return async function request({
		baseUrl,
		token,
	}: RequestOptions): Promise<undefined> {
		log.info('Making a request')
		const response = await get({
			url: `${baseUrl}/results`,
			headers: {
				authorization: `Bearer ${token}`,
			},
		})

		switch (response.statusCode) {
			case 204:
				return
			case 401:
				throw new InvalidSessionError('session timeout')
			default:
				log.info({result: response.body}, 'New result')
				stream.push(response.body)
				return
		}
	}
}
