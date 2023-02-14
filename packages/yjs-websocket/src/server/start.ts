#!/usr/bin/env node
/* eslint-disable turbo/no-undeclared-env-vars */

import WebSocket from 'ws'
import http from 'http'
import { Element } from '@editablejs/models'
import { setupWSConnection, UpdateCallback } from './utils'
import { initPersistence, PersistenceOptions } from './persistence'

const wss = new WebSocket.Server({ noServer: true })

export interface ServerOptions {
  host: string
  port: number
  // 效验
  auth?: (
    request: http.IncomingMessage,
    ws: WebSocket,
  ) => Promise<void | { code: number; data: string | Buffer }>
  // 持久化选项，false 为不持久化
  persistenceOptions?: PersistenceOptions | false
  // 文档内容字段，默认为 content
  contentField?: string
  // 更新回调
  callback?: UpdateCallback
  // 初始值
  initialValue?: Element
}

const SERVER_OPTIONS_WEAKMAP = new WeakMap<http.Server, ServerOptions>()

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

wss.on('connection', (conn, req) => {
  const { initialValue, callback } = SERVER_OPTIONS_WEAKMAP.get(server) ?? {}
  setupWSConnection(conn, req, {
    initialValue,
    callback,
  })
})

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  // See https://github.com/websockets/ws#client-authentication
  const handleAuth = (ws: WebSocket) => {
    const { auth = () => Promise.resolve() } = SERVER_OPTIONS_WEAKMAP.get(server) ?? {}
    auth(request, ws).then(res => {
      if (res && res.code !== 200) {
        ws.close(res.code, res.data)
      } else {
        wss.emit('connection', ws, request)
      }
    })
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

export const startServer = (options: ServerOptions) => {
  SERVER_OPTIONS_WEAKMAP.set(server, options)
  const { host, port, persistenceOptions = { provider: 'leveldb' }, contentField } = options

  if (persistenceOptions !== false) {
    initPersistence(persistenceOptions, contentField)
  }

  server.listen(port, host, () => {
    console.log(`running at '${host}' on port ${port}`)
  })
  return server
}
