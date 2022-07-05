export interface RequestOptions {
	baseUrl: string
	token: string
}

export interface RequestFn {
	(options: RequestOptions): Promise<undefined>
}
