# HROSS

This applications fetches race events and stores in a MongoDB.

# Installation

Follow these steps to intall and run:

```shell
git clone git@github.com:djupudga/hross.git
cd hross
# Edit .env and .test.env files
# Add the following:
# EMAIL=your email
# PASSWORD=your password
make install
make start

# to view logs run
make logs
```

# Usage

Commands:

## Makefile

- `make install`: Install dependencies
- `make start`: Start compose application
- `make stop`: Stop compose application
- `make logs`: View compose logs
- `make build`: Rebuild node app and images
- `make prune`: Remove compose volumes and containers
- `make mongo_shell`: Open mongo shell

### NPM commands

- `npm run watch`: Watch and compile ts files
- `npm run build`: Build distribution
- `npm run clean`: Clean distribution
- `npm run start`: Start local application
- `npm run format`: Run prettier
- `npm run test`: Run unit/integration tests with coverage

### Compose commands

To run a local app with mongodb docker image run these commands:

```shell
docker compose create mongodb
docker compose start mongodb
npm run start
```

# Architecture

## Main loop

The functionality of the application is driven by a main loop in
`src/index.ts`. Requests are made using nested (wrapped) functions,
like this:

```
mainLoop -> backoff -> authenticate -> poller -> request
```

The roles of the functions are like this:

- **request**: Fetches race results from backend. Race results are
  published to a `Readable` stream.
- **poller**: Continually calls the `request` function in a loop.
- **authenticate**: Logs in to `/auth` to retrieve a token and calls
  `poller` with the token.
- **backoff**: Calls the `authenticate` function. In case of a
  `ServerBusyError` it waits for a set time before re-throwing the
  error.
- **mainLoop**: Continually calls the `backoff` function until an
  error is thrown, except when `ServerBusyError` or `InvalidSessionError`
  are thrown, in which case the loop continues.

The actual base HTTP GET/POST calls are implemented in separate functions
making the above functions easier to test plus keeping the HTTP API separate
from the main application API.

## Data storage layer

Horse race events are stored in MongoDB. The events are sent via a
`Writable` stream. The stream converts the JSON string results to
object and sends them to `src/data/service.ts` for processing. The
service has some minor logic to package and store related race event in
a single race in the db as well as simple normalization of horses.

I did not use mongo transactions since that would have required
some extra mongo configuration and it felt a bit too much for this
test case.

The idea here is to subscribe to events and use the service logic
to assemble or "interpret" the events into data structures that "make sense".
So, events are grouped into races. A race is therefore a collection
of the horses that participated in the race and their times.

As the `/results` service returns data at random, the first race
may be incomplete. This is a tradeoff for this exercise.

If mongo goes down and comes up again, the driver should automatically
reconnect to mongo and event processing should resume.

# Notes

## Mongo and writable stream

There is some latency when using streams. This shows up in the
simple integration test, since the stream/mongo must fully drain
before running assertions against data saved into mongo. Here
I just opted to wait awhile. This happens because the calls to
the stream are synchronous and fan out into asynchronous calls
during processing.

## ESM

The project uses `got` as an http client. The got project transpiles
to ESM modules, which has certain "implications" on a Typescript project
as well as when using `jest` as a test framework. Additionally, this project
emits transpiled code as ESM modules into the `./lib` folder.

Because of this the following applies:

1. Imports of local files must contain `.js` extensions.
2. Jest must be configured using `moduleNameMapper` to ignore the
   extensions when it transpiles internally
   (see: https://github.com/swc-project/jest/issues/64).

The `tsconfig` has been kept rather strict. The Jest config as simple as
possible. The transpiled/emitted JavaScript code as readable as possible.

## Code style

Enforce max 80 char line lengths. Tabs with tab length 2. Avoid unnecessary
semi-colons and commas. Keep it clean, readable and simple.
