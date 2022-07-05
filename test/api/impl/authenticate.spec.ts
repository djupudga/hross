// import { HttpPostFn } from '../../../src/api/http'
import {AuthenticationError, ServerBusyError} from '../../../src/api/errors'
import {createAuthenticator} from '../../../src/api/impl/authenticate'

const mockOptions = {
	baseUrl: '',
	json: {
		email: 'foo',
		password: 'bar',
	},
}

describe('authenticate', () => {
	describe('#createAuthenticator', () => {
		it('calls request function if authenticated', async () => {
			const response = {statusCode: 200, body: '{"token":"token"}'}
			const postFnMock = jest.fn().mockReturnValue(response)
			const requestFnMock = jest.fn()
			const fn = createAuthenticator(mockOptions, postFnMock, requestFnMock)
			await fn()
			expect(requestFnMock).toBeCalledTimes(1)
		})
		it('throws AuthenticationError on 401', async () => {
			const response = {statusCode: 401}
			const postFnMock = jest.fn().mockReturnValue(response)
			const requestFnMock = jest.fn()
			const fn = createAuthenticator(mockOptions, postFnMock, requestFnMock)
			await expect(fn()).rejects.toThrow(AuthenticationError)
		})
		it('throws ServerBusyError on 502', async () => {
			const response = {statusCode: 503}
			const postFnMock = jest.fn().mockReturnValue(response)
			const requestFnMock = jest.fn()
			const fn = createAuthenticator(mockOptions, postFnMock, requestFnMock)
			await expect(fn()).rejects.toThrow(ServerBusyError)
		})
		it('throws Error on any other code', async () => {
			const response = {statusCode: 500, statusMessage: 'foo'}
			const postFnMock = jest.fn().mockReturnValue(response)
			const requestFnMock = jest.fn()
			const fn = createAuthenticator(mockOptions, postFnMock, requestFnMock)
			try {
				await fn()
			} catch (e: any) {
				expect(e.message).toContain('foo')
			}
		})
	})
})
