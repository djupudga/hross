import 'dotenv/config'
import {Readable} from 'node:stream'
import {pipeline} from 'node:stream/promises'
import mongoose from 'mongoose'
import {createAuthenticator} from './api/impl/authenticate.js'
import {backoff} from './api/impl/backoff.js'
import {config} from './config.js'
import {MongoWritable} from './data/mongo-writable.js'
import log from './log.js'
import {createPoller} from './api/impl/poller.js'
import {createRequestFunction} from './api/impl/request.js'
import {httpGet, httpPost} from './api/impl/http-impl.js'
import {InvalidSessionError, ServerBusyError} from './api/errors.js'
import {server, setStatus} from './health.js'

// Configuration is from a config object, which is populated
// by environment variables.
const {baseUrl, email, password} = config.trav

const eventStream = new Readable({
	read() {
		// Do nothing. This method only signals that the
		// stream should read from the underlying
		// datasource, which is not really needed
		// since Request fn will be continuously pushing
		// to the stream.
	},
})

// Receives events to be written to mongo
const mongoWritable = new MongoWritable()

// Sends horse reace events to mongo db.
pipeline(eventStream, mongoWritable)

// Create the function that fetches horse race events
const request = createRequestFunction(eventStream, httpGet)
// Create the function that manages request polling
const poller = createPoller(request)
// Create the function that manages authentication
const authFunction = createAuthenticator(
	{
		baseUrl: baseUrl,
		json: {email, password},
	},
	httpPost,
	poller
)

// The main loop is just a never ending loop
// that checks for recovarable error conditions.
// It the session has expired or if the auth-server
// is busy, authentication is
// initiated and the request polling starts again.
// For any other errors, the server bails.
async function mainLoop() {
	log.info('HROSS starting')
	// Starthing healthz web server
	server.listen(config.server.port, () => {
		log.info(`Server listening on port ${config.server.port}`)
	})
	// Mongo may not be ready so waiting.
	// Possible this is not really needed, but why not
	let retry = 0
	while (true) {
		log.info(`Connecting to mongodb at ${config.mongo.url}`)
		try {
			await mongoose.connect(config.mongo.url, config.mongo.connect)
			setStatus('ready')
			break
		} catch (err) {
			if (++retry > config.mongo.retryCount) throw new Error('Mongo db down')
			setStatus('not-ready')
			log.info({err}, 'Mongo not ready')
		}
	}
	log.info('Mongo connected')
	while (true) {
		try {
			// Main logic for fetching those race events
			await backoff(authFunction)
		} catch (err) {
			if (unrecoverable(err)) {
				throw err
			}
			log.info({err}, 'recovering')
		}
	}
}

function unrecoverable(e: unknown) {
	if (e instanceof InvalidSessionError) return true
	if (e instanceof ServerBusyError) return true

	return false
}

mainLoop()
	.then(() => {
		log.info('HROSS exiting')
	})
	.catch((err) => {
		log.error({err}, 'Unrecovarable error, bailing')
		server.close()
	})
