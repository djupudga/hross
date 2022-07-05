import {AuthenticationError} from '../../src/api/errors'

describe('errors', () => {
	describe('AuthenticationError', () => {
		it('should be Error like', () => {
			const e = new AuthenticationError('message')
			expect(e.message).toBe('message')
		})
	})
})
