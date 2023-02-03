import { ServerOptions, startServer } from './server/start'

export default (options: Partial<ServerOptions> = {}) => {
  const {
    host = process.env.HOST || '0.0.0.0',
    port = parseInt(process.env.PORT || '1234') || 1234,
  } = options
  startServer({
    ...options,
    host,
    port,
  })
}
