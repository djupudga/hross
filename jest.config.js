import path from 'path'
import dotenv from 'dotenv'

dotenv.config({
  path: path.resolve(process.cwd(), '.test.env'),
})

export default {
  preset: 'ts-jest',
  transform: {'^.+\\.ts?$': 'ts-jest'},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node'
}
