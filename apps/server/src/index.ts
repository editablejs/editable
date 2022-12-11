/* eslint-disable turbo/no-undeclared-env-vars */
import { startServer } from './server'

const host = process.env.HOST || '0.0.0.0'
const port = parseInt(process.env.PORT || '1234') || 1234

startServer(host, port)
