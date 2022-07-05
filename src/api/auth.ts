export interface Credentials {
	email: string
	password: string
}

export interface Token {
	token: string
}

export interface AuthOptions {
	baseUrl: string
	json: Credentials
}
