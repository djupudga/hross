import http from 'http'

type Status = 'ready' | 'not-ready'

const READY = 200
const NOT_READY = 503

const health: {status: typeof READY | typeof NOT_READY} = {
  status: NOT_READY,
}

// Simple web server with one /healthz endpoint
// that reports the readyness of the service
export const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end(`{"error": "${http.STATUS_CODES[405]}"}`)
  } else if (req.url === '/healthz') {
    res.statusCode = health.status
    res.end(`{"status": ${health.status}}`)
  } else {
    res.statusCode = 404
    res.end(`{"error": "${http.STATUS_CODES[404]}"}`)
  }
})

// Allows us to set the health status of the service
export function setStatus(status: Status) {
  health.status = status === 'ready' ? READY : NOT_READY
}
