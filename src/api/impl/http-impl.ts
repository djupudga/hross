import got from 'got'
import type {
	HttpGetFn,
	HttpGetOptions,
	HttpPostFn,
	HttpPostOptions,
} from '../http.js'

export const httpPost: HttpPostFn = async (options: HttpPostOptions) => {
	return await got.post(options)
}

export const httpGet: HttpGetFn = async (options: HttpGetOptions) => {
	return await got.get(options)
}
