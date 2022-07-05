import bunyan from 'bunyan'
import type {LogLevelString} from 'bunyan'

const DEFAULT_HEALTH_PORT = 8080
const DEFAULT_BACKOFF = 500
const DEFAULT_MONGO_RETRY_COUNT = 5

function envNumber(envVarName: string) {
  const port = parseInt(`${process.env[envVarName]}`, 10)
  if (isNaN(port)) return void 0

  return port
}

export const config = {
  mongo: {
    url: process.env['MONGO_URL'] as string,
    retryCount: envNumber('MONGO_RETRY_COUNT') || DEFAULT_MONGO_RETRY_COUNT,
    connect: {
      auth: {
        username: process.env['MONGO_UID'] as string,
        password: process.env['MONGO_PWD'] as string,
      },
    },
  },
  server: {
    port: envNumber('PORT') || DEFAULT_HEALTH_PORT,
    backoff: envNumber('BACKOFF') || DEFAULT_BACKOFF,
  },
  trav: {
    baseUrl: process.env['BASE_URL'] as string,
    email: process.env['EMAIL'] as string,
    password: process.env['PASSWORD'] as string,
  },
  log: {
    name: 'hross',
    src: true,
    serializers: bunyan.stdSerializers,
    level: (process.env['LOG_LEVEL'] || 'info') as LogLevelString,
  },
}
