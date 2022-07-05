import bunyan from 'bunyan'
import {config} from './config.js'

export default bunyan.createLogger({
  name: config.log.name,
  level: config.log.level,
  serializers: config.log.serializers,
  src: config.log.src,
})
