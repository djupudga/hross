import log from '../../log.js'
import type {AuthOptions, Token} from '../auth.js'
import {AuthenticationError, ServerBusyError} from '../errors.js'
import type {HttpPostFn} from '../http.js'
import type {RequestFn} from '../request-fn.js'

export function createAuthenticator(
	{baseUrl, json}: AuthOptions,
	auth: HttpPostFn,
	request: RequestFn
) {
	return async () => {
		log.info('Authenticating')
		const response = await auth({
			url: `${baseUrl}/auth`,
			json,
		})

		switch (response.statusCode) {
			case 200:
				const {token} = JSON.parse(response.body) as Token
				log.info({token}, 'Authentication successful')
				await request({baseUrl, token})
				break
			case 401:
				throw new AuthenticationError('invalid credentials')
			case 503:
				throw new ServerBusyError('server busy')
			default:
				throw new Error(`unrecoverable: ${response.statusMessage}`)
		}
	}
}
