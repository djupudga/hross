import type {Headers, Response} from 'got'

export interface HttpPostOptions {
	url: string
	json?: Record<string, any>
}

export type HttpPostFn = (options: HttpPostOptions) => Promise<Response<string>>

export interface HttpGetOptions {
	url: string
	headers: Headers
}

export type HttpGetFn = (options: HttpGetOptions) => Promise<Response<string>>
