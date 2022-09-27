#!/usr/bin/env node
/* eslint-disable turbo/no-undeclared-env-vars */

import WebSocket from 'ws'
import http from 'http'
import { setupWSConnection } from './utils'
const wss = new WebSocket.Server({ noServer: true })

const host = process.env.HOST || 'localhost'
const port = parseInt(process.env.PORT || '1234') || 1234

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

wss.on('connection', setupWSConnection)

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  // See https://github.com/websockets/ws#client-authentication
  const handleAuth = (ws: WebSocket) => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`)
})
