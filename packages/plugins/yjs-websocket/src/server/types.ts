import WebSocket from 'ws'
import awarenessProtocol from '@editablejs/yjs-protocols/awareness'
import { Doc } from 'yjs'

export interface WSSharedDoc extends Doc {
  name: string
  conns: Map<WebSocket.WebSocket, Set<number>>
  awareness: awarenessProtocol.Awareness
  getSubDoc(id: string): Doc | undefined
}

export type ContentType = 'Array' | 'Map' | 'Text' | 'XmlFragment'
