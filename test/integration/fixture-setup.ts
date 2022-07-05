import mongoose from 'mongoose'
import {config} from '../../src/config'
import {Horse, Race} from '../../src/data/models'

export async function cleanDb() {
	await Race.deleteMany({})
	await Horse.deleteMany({})
}

export async function setup() {
	await mongoose.connect(config.mongo.url, config.mongo.connect)
	await cleanDb()
}

export async function teardown() {
	await cleanDb()
	await mongoose.connection.close()
}

export async function forThis(ms: number) {
	await new Promise((r) => setTimeout(r, ms))
}
