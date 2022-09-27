import WebSocket from 'ws'
import awarenessProtocol from 'y-protocols/awareness'
import { Doc } from 'yjs'

export interface WSSharedDoc extends Doc {
  name: string
  conns: Map<WebSocket.WebSocket, Set<number>>
  awareness: awarenessProtocol.Awareness
}
