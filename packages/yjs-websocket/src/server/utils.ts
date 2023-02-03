/* eslint-disable turbo/no-undeclared-env-vars */
import WebSocket from 'ws'
import http from 'http'
import * as Y from 'yjs'
import { Element } from '@editablejs/models'
import * as syncProtocol from '@editablejs/yjs-protocols/sync'
import * as awarenessProtocol from '@editablejs/yjs-protocols/awareness'

import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as map from 'lib0/map'

import debounce from 'lodash.debounce'
import { WSSharedDoc as WSSharedDocInterface } from './types'

import { callbackHandler, CallbackOptions } from './callback'
import { getPersistence } from './persistence'
import { messageAwareness, messageSubDocSync, messageSync } from '../message'

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0'

export const docs: Map<string, WSSharedDoc> = new Map()

// const messageAuth = 2

const updateHandler = (update: Uint8Array, origin: string, doc: WSSharedDocInterface) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  encoding.writeAny(encoder, origin ?? {})
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

const updateSubDocHandler = (
  subId: string,
  update: Uint8Array,
  origin: string,
  doc: WSSharedDocInterface,
) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSubDocSync)
  encoding.writeVarString(encoder, subId)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

interface AwarenessChangeHandlerOptions {
  added: number[]
  updated: number[]
  removed: number[]
}

export type UpdateCallback = CallbackOptions & {
  // 默认 2000
  debounceWait?: number
  // 默认 10000
  debounceMaxWait?: number
}

class WSSharedDoc extends Y.Doc implements WSSharedDocInterface {
  name: string
  conns: Map<WebSocket.WebSocket, Set<number>>
  awareness: awarenessProtocol.Awareness
  subDocs: Map<string, Y.Doc> = new Map()
  /**
   * @param {string} name
   */
  constructor(name: string, callback?: UpdateCallback) {
    super({ gc: gcEnabled })
    this.name = name

    this.conns = new Map()

    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)

    const awarenessChangeHandler = (
      { added, updated, removed }: AwarenessChangeHandlerOptions,
      conn: WebSocket.WebSocket | null,
    ) => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs = this.conns.get(conn)
        if (connControlledIDs !== undefined) {
          added.forEach(clientID => {
            connControlledIDs.add(clientID)
          })
          removed.forEach(clientID => {
            connControlledIDs.delete(clientID)
          })
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients),
      )
      const buff = encoding.toUint8Array(encoder)
      this.conns.forEach((_, c) => {
        send(this, c, buff)
      })
    }
    this.awareness.on('update', awarenessChangeHandler)
    this.on('updateV2', updateHandler)

    const handleSubDocUpdate = (update: Uint8Array, origin: string, subDoc: Y.Doc) => {
      updateSubDocHandler(subDoc.guid, update, origin, this)
    }

    const _subDocsHandler = ({
      added,
      removed,
      loaded,
    }: Record<'added' | 'removed' | 'loaded', Y.Doc[]>) => {
      added.forEach(subDoc => {
        this.subDocs.set(subDoc.guid, subDoc)
      })
      removed.forEach(subDoc => {
        subDoc.off('updateV2', handleSubDocUpdate)
        this.subDocs.delete(subDoc.guid)
      })
      loaded.forEach(subDoc => {
        subDoc.on('updateV2', handleSubDocUpdate)
        this.emit('subDocLoaded', [subDoc])
      })
    }
    this.on('subdocs', _subDocsHandler)

    if (callback) {
      const { debounceWait = 2000, debounceMaxWait = 10000 } = callback
      this.on(
        'updateV2',
        debounce(
          (update: Uint8Array, origin: string, doc: WSSharedDocInterface) =>
            callbackHandler(doc, callback),
          debounceWait,
          { maxWait: debounceMaxWait },
        ),
      )
    }
  }

  destroy(): void {
    this.subDocs.forEach(subDoc => {
      subDoc.destroy()
    })
    super.destroy()
  }

  getSubDoc(id: string) {
    return this.subDocs.get(id)
  }
}

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 */
export const getYDoc = (
  docname: string,
  gc: boolean = true,
  initialValue?: Element,
  callback?: UpdateCallback,
): WSSharedDocInterface =>
  map.setIfUndefined(docs, docname, () => {
    const doc = new WSSharedDoc(docname, callback)
    doc.gc = gc
    const persistence = getPersistence()
    if (persistence !== null) {
      persistence.bindState(docname, doc, initialValue)
    }
    docs.set(docname, doc)
    return doc
  })

const readSyncMetaMessage = (
  decoder: decoding.Decoder,
  encoder: encoding.Encoder,
  doc: Y.Doc,
  transactionOrigin: any,
) => {
  const meta = decoding.readAny(decoder)
  if (!transactionOrigin) {
    transactionOrigin = meta
  }
  return syncProtocol.readSyncMessage(decoder, encoder, doc, transactionOrigin, () => {
    encoding.writeAny(encoder, meta)
  })
}

const messageListener = (
  conn: WebSocket.WebSocket,
  doc: WSSharedDocInterface,
  message: Uint8Array,
) => {
  try {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)
    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        readSyncMetaMessage(decoder, encoder, doc, null)
        // If the `encoder` only contains the type of reply message and no
        // message, there is no need to send the message. When `encoder` only
        // contains the type of reply, its length is 1.
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }
        break
      case messageSubDocSync:
        encoding.writeVarUint(encoder, messageSubDocSync)
        const subId = decoding.readVarString(decoder)
        const subDoc = doc.getSubDoc(subId)
        if (!subDoc) break
        syncProtocol.readSyncMessage(decoder, encoder, subDoc, null, () => {
          encoding.writeVarString(encoder, subId)
        })
        // If the `encoder` only contains the type of reply message and no
        // message, there is no need to send the message. When `encoder` only
        // contains the type of reply, its length is 1.
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn,
        )
        break
      }
    }
  } catch (err) {
    console.error(err)
    doc.emit('error', [err])
  }
}

const closeConn = (doc: WSSharedDocInterface, conn: WebSocket.WebSocket) => {
  if (doc.conns.has(conn)) {
    const controlledIds: Set<number> = doc.conns.get(conn)!
    doc.conns.delete(conn)
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)
    const persistence = getPersistence()
    if (doc.conns.size === 0 && persistence !== null) {
      // if persisted, we store state and destroy ydocument
      persistence.writeState(doc.name, doc).then(() => {
        doc.destroy()
      })
      docs.delete(doc.name)
    }
  }
  conn.close()
}

const send = (doc: WSSharedDocInterface, conn: WebSocket.WebSocket, m: Uint8Array) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    closeConn(doc, conn)
  }
  try {
    conn.send(m, (err: any) => {
      err != null && closeConn(doc, conn)
    })
  } catch (e) {
    closeConn(doc, conn)
  }
}

interface SetupWSConnectionOptions {
  docName?: string
  gc?: boolean
  initialValue?: Element
  pingTimeout?: number
  callback?: UpdateCallback
}

export const setupWSConnection = (
  conn: WebSocket.WebSocket,
  req: http.IncomingMessage,
  options?: SetupWSConnectionOptions,
) => {
  const {
    docName = req.url!.slice(1).split('?')[0],
    gc = true,
    initialValue,
    pingTimeout = 30000,
    callback,
  } = options ?? {}
  conn.binaryType = 'arraybuffer'
  // get doc, initialize if it does not exist yet
  const doc = getYDoc(docName, gc, initialValue, callback)
  doc.conns.set(conn, new Set())
  doc.on('subDocLoaded', subDoc => {
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSubDocSync)
    encoding.writeVarString(encoder, subDoc.guid)
    syncProtocol.writeSyncStep1(encoder, subDoc)
    send(doc, conn, encoding.toUint8Array(encoder))
  })
  // listen and reply to events
  conn.on('message', (message: ArrayBuffer) => messageListener(conn, doc, new Uint8Array(message)))

  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn)
      }
      clearInterval(pingInterval)
    } else if (doc.conns.has(conn)) {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        closeConn(doc, conn)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)
  conn.on('close', () => {
    closeConn(doc, conn)
    clearInterval(pingInterval)
  })
  conn.on('pong', () => {
    pongReceived = true
  })
  // put the following in a variables in a block so the interval handlers don't keep in in
  // scope
  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    encoding.writeAny(encoder, {})
    syncProtocol.writeSyncStep1(encoder, doc)
    send(doc, conn, encoding.toUint8Array(encoder))
    const awarenessStates = doc.awareness.getStates()
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())),
      )
      send(doc, conn, encoding.toUint8Array(encoder))
    }
  }
}
