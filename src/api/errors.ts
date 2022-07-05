export class AuthenticationError extends Error {
	constructor(message: string) {
		super(message)
		Object.setPrototypeOf(this, AuthenticationError.prototype)
	}
}

export class ServerBusyError extends Error {
	constructor(message: string) {
		super(message)
		Object.setPrototypeOf(this, ServerBusyError.prototype)
	}
}

export class InvalidSessionError extends Error {
	constructor(message: string) {
		super(message)
		Object.setPrototypeOf(this, InvalidSessionError.prototype)
	}
}
