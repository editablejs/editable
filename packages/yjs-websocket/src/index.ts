import * as Y from 'yjs'
import * as bc from 'lib0/broadcastchannel'
import * as time from 'lib0/time'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as syncProtocol from '@editablejs/yjs-protocols/sync'
import * as authProtocol from '@editablejs/yjs-protocols/auth'
import * as awarenessProtocol from '@editablejs/yjs-protocols/awareness'
import { Observable } from 'lib0/observable'
import * as math from 'lib0/math'
import * as url from 'lib0/url'
import {
  messageSync,
  messageQueryAwareness,
  messageAwareness,
  messageAuth,
  messageSubDocSync,
} from './message'

type MessageHandler = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: WebsocketProvider,
  emitSynced: boolean,
  messageType: number,
) => void

const messageHandlers: MessageHandler[] = []

const readSyncMetaMessage = (
  decoder: decoding.Decoder,
  encoder: encoding.Encoder,
  doc: Y.Doc,
  transactionOrigin: any,
) => {
  encoding.writeVarUint(encoder, messageSync)
  const meta = decoding.readAny(decoder)
  if (typeof transactionOrigin === 'object' && transactionOrigin !== null) {
    ;(transactionOrigin as any).meta = meta
  }
  return syncProtocol.readSyncMessage(decoder, encoder, doc, transactionOrigin, () => {
    encoding.writeAny(encoder, meta)
  })
}

messageHandlers[messageSync] = (encoder, decoder, provider, emitSynced, _messageType) => {
  const syncMessageType = readSyncMetaMessage(decoder, encoder, provider.doc, provider)
  if (emitSynced && syncMessageType === syncProtocol.messageYjsSyncStep2 && !provider.synced) {
    provider.synced = true
  }
}

messageHandlers[messageQueryAwareness] = (
  encoder,
  _decoder,
  provider,
  _emitSynced,
  _messageType,
) => {
  encoding.writeVarUint(encoder, messageAwareness)
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(
      provider.awareness,
      Array.from(provider.awareness.getStates().keys()),
    ),
  )
}

messageHandlers[messageAwareness] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
  awarenessProtocol.applyAwarenessUpdate(
    provider.awareness,
    decoding.readVarUint8Array(decoder),
    provider,
  )
}

messageHandlers[messageAuth] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
  authProtocol.readAuthMessage(decoder, provider.doc, (_ydoc, reason) =>
    permissionDeniedHandler(provider, reason),
  )
}

messageHandlers[messageSubDocSync] = (encoder, decoder, provider, emitSynced) => {
  const subDocID = decoding.readVarString(decoder)
  encoding.writeVarUint(encoder, messageSubDocSync)
  const subDoc = provider.getSubDoc(subDocID)
  if (subDoc) {
    const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, subDoc, provider, () => {
      encoding.writeVarString(encoder, subDocID)
    })
    if (emitSynced && syncMessageType === syncProtocol.messageYjsSyncStep2) {
      subDoc.emit('synced', [true])
    }
  }
}

// @todo - this should depend on awareness.outdatedTime
const messageReconnectTimeout = 30000

/**
 * @param {WebsocketProvider} provider
 * @param {string} reason
 */
const permissionDeniedHandler = (provider: WebsocketProvider, reason: string) =>
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`)

const readMessage = (provider: WebsocketProvider, buf: Uint8Array, emitSynced: boolean) => {
  const decoder = decoding.createDecoder(buf)
  const encoder = encoding.createEncoder()
  const messageType = decoding.readVarUint(decoder)
  const messageHandler = provider.messageHandlers[messageType]
  if (/** @type {any} */ messageHandler) {
    messageHandler(encoder, decoder, provider, emitSynced, messageType)
  } else {
    console.error('Unable to compute message')
  }
  return encoder
}

const setupWS = (provider: WebsocketProvider) => {
  if (provider.shouldConnect && provider.ws === null) {
    const websocket = new provider._WS(provider.url)
    websocket.binaryType = 'arraybuffer'
    provider.ws = websocket
    provider.wsconnecting = true
    provider.wsconnected = false
    provider.synced = false

    websocket.onmessage = event => {
      provider.wsLastMessageReceived = time.getUnixTime()
      const encoder = readMessage(provider, new Uint8Array(event.data), true)
      if (encoding.length(encoder) > 1) {
        websocket.send(encoding.toUint8Array(encoder))
      }
    }
    websocket.onerror = event => {
      provider.emit('connection-error', [event, provider])
    }
    websocket.onclose = event => {
      provider.emit('connection-close', [event, provider])
      provider.ws = null
      provider.wsconnecting = false
      if (provider.wsconnected) {
        provider.wsconnected = false
        provider.synced = false
        // update awareness (all users except local left)
        awarenessProtocol.removeAwarenessStates(
          provider.awareness,
          Array.from<number>(provider.awareness.getStates().keys()).filter(
            client => client !== provider.doc.clientID,
          ),
          provider,
        )
        provider.emit('status', [
          {
            status: 'disconnected',
          },
        ])
      } else {
        provider.wsUnsuccessfulReconnects++
      }
      // Start with no reconnect timeout and increase timeout by
      // using exponential backoff starting with 100ms
      setTimeout(
        setupWS,
        math.min(math.pow(2, provider.wsUnsuccessfulReconnects) * 100, provider.maxBackoffTime),
        provider,
      )
    }
    websocket.onopen = () => {
      provider.wsLastMessageReceived = time.getUnixTime()
      provider.wsconnecting = false
      provider.wsconnected = true
      provider.wsUnsuccessfulReconnects = 0
      provider.emit('status', [
        {
          status: 'connected',
        },
      ])
      // always send sync step 1 when connected
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageSync)
      encoding.writeAny(encoder, {})
      syncProtocol.writeSyncStep1(encoder, provider.doc)
      websocket.send(encoding.toUint8Array(encoder))
      // broadcast local awareness state
      if (provider.awareness.getLocalState() !== null) {
        const encoderAwarenessState = encoding.createEncoder()
        encoding.writeVarUint(encoderAwarenessState, messageAwareness)
        encoding.writeVarUint8Array(
          encoderAwarenessState,
          awarenessProtocol.encodeAwarenessUpdate(provider.awareness, [provider.doc.clientID]),
        )
        websocket.send(encoding.toUint8Array(encoderAwarenessState))
      }
    }

    provider.emit('status', [
      {
        status: 'connecting',
      },
    ])
  }
}

const broadcastMessage = (provider: WebsocketProvider, buf: ArrayBuffer) => {
  if (provider.wsconnected) {
    provider.ws?.send(buf)
  }
  if (provider.bcconnected) {
    bc.publish(provider.bcChannel, buf, provider)
  }
}

/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url. I.e. the following example
 * creates a websocket connection to http://localhost:1234/my-document-name
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { WebsocketProvider } from 'y-websocket'
 *   const doc = new Y.Doc()
 *   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
 *
 */
export class WebsocketProvider extends Observable<string> {
  maxBackoffTime: number
  bcChannel: string
  url: string
  roomname: string
  doc: Y.Doc
  subDocs: Map<string, Y.Doc> = new Map()
  meta: Record<string, any> = {}
  _WS: typeof WebSocket
  awareness: awarenessProtocol.Awareness
  wsconnected: boolean
  wsconnecting: boolean
  bcconnected: boolean
  disableBc: boolean
  wsUnsuccessfulReconnects: number
  messageHandlers: MessageHandler[]
  _synced: boolean
  ws: WebSocket | null
  wsLastMessageReceived: number
  shouldConnect: boolean
  _resyncInterval: number
  _bcSubscriber: (data: any, origin: any) => void
  _updateHandler: (update: any, origin: any, _: any, transaction: any) => void
  _awarenessUpdateHandler: (
    { added, updated, removed }: { added: any; updated: any; removed: any },
    _origin: any,
  ) => void
  _unloadHandler: () => void
  _checkInterval: number
  _subDocsHandler: ({
    added,
    removed,
    loaded,
  }: Record<'added' | 'removed' | 'loaded', Y.Doc[]>) => void
  _updateSubDocHandler: (update: Uint8Array, origin: unknown, doc: Y.Doc) => void

  constructor(
    serverUrl: string,
    roomname: string,
    doc: Y.Doc,
    {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      params = {},
      WebSocketPolyfill = WebSocket,
      resyncInterval = -1,
      maxBackoffTime = 2500,
      disableBc = false,
    }: {
      connect?: boolean
      awareness?: awarenessProtocol.Awareness
      params?: { [key: string]: string }
      WebSocketPolyfill?: typeof WebSocket
      resyncInterval?: number
      maxBackoffTime?: number
      disableBc?: boolean
    } = {},
  ) {
    super()
    // ensure that url is always ends with /
    while (serverUrl[serverUrl.length - 1] === '/') {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1)
    }
    const encodedParams = url.encodeQueryParams(params)
    this.maxBackoffTime = maxBackoffTime
    this.bcChannel = serverUrl + '/' + roomname
    this.url = serverUrl + '/' + roomname + (encodedParams.length === 0 ? '' : '?' + encodedParams)
    this.roomname = roomname
    this.doc = doc
    this._WS = WebSocketPolyfill
    this.awareness = awareness
    this.wsconnected = false
    this.wsconnecting = false
    this.bcconnected = false
    this.disableBc = disableBc
    this.wsUnsuccessfulReconnects = 0
    this.messageHandlers = messageHandlers.slice()
    this._synced = false
    this.ws = null
    this.wsLastMessageReceived = 0

    this.shouldConnect = connect

    this._resyncInterval = 0
    if (resyncInterval > 0) {
      // @ts-ignore
      this._resyncInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          // resend sync step 1
          const encoder = encoding.createEncoder()
          encoding.writeVarUint(encoder, messageSync)
          encoding.writeAny(encoder, {})
          syncProtocol.writeSyncStep1(encoder, doc)
          this.ws.send(encoding.toUint8Array(encoder))
        }
      }, resyncInterval)
    }

    this._bcSubscriber = (data: ArrayBuffer, origin: unknown) => {
      if (origin !== this) {
        const encoder = readMessage(this, new Uint8Array(data), false)
        if (encoding.length(encoder) > 1) {
          bc.publish(this.bcChannel, encoding.toUint8Array(encoder), this)
        }
      }
    }
    /**
     * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
     */
    this._updateHandler = (update: Uint8Array, origin: unknown, _, transaction) => {
      if (origin !== this) {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        // 发送 meta 信息
        const meta: Record<string, any> = {}
        for (const [key, value] of transaction.meta) {
          meta[key] = value
        }
        encoding.writeAny(encoder, meta)
        syncProtocol.writeUpdate(encoder, update)
        broadcastMessage(this, encoding.toUint8Array(encoder))
      }
    }
    this.doc.on('updateV2', this._updateHandler)

    /**
     *
     * @param callback
     * @param interval
     */
    const waitForConnection = (callback: Function, interval: number) => {
      const ws = this.ws
      if (ws && ws.readyState === 1) {
        callback()
      } else {
        // optional: implement backoff for interval here
        setTimeout(function () {
          waitForConnection(callback, interval)
        }, interval)
      }
    }

    /**
     * When dealing with subdocs, it is possible to race the websocket connection
     * where we are ready to load subdocuments but the connection is not yet ready to send
     * This function is just a quick and dirty retry function for when we can't be sure
     * if the connection is present
     * @param message
     * @param callback
     */
    const waitSend = (message: any, callback: Function) => {
      waitForConnection(() => {
        this.ws?.send(message)
        if (typeof callback !== 'undefined') {
          callback()
        }
      }, 1000)
    }

    this._updateSubDocHandler = (update: Uint8Array, origin: unknown, doc: Y.Doc) => {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageSubDocSync)
      encoding.writeVarString(encoder, doc.guid)
      syncProtocol.writeUpdate(encoder, update)
      broadcastMessage(this, encoding.toUint8Array(encoder))
    }

    this._subDocsHandler = ({
      added,
      removed,
      loaded,
    }: Record<'added' | 'removed' | 'loaded', Y.Doc[]>) => {
      added.forEach(subDoc => {
        this.subDocs.set(subDoc.guid, subDoc)
      })
      removed.forEach(subDoc => {
        subDoc.off('updateV2', this._updateSubDocHandler)
        this.subDocs.delete(subDoc.guid)
      })
      loaded.forEach(subDoc => {
        // always send sync step 1 when connected
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSubDocSync)
        encoding.writeVarString(encoder, subDoc.guid)
        syncProtocol.writeSyncStep1(encoder, subDoc)
        if (this.ws) {
          waitSend(encoding.toUint8Array(encoder), () => {
            subDoc.on('updateV2', this._updateSubDocHandler)
          })
        }
      })
    }

    this.doc.on('subdocs', this._subDocsHandler)

    /**
     * @param {any} changed
     * @param {any} _origin
     */
    this._awarenessUpdateHandler = ({ added, updated, removed }, _origin) => {
      const changedClients = added.concat(updated).concat(removed)
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients),
      )
      broadcastMessage(this, encoding.toUint8Array(encoder))
    }
    this._unloadHandler = () => {
      awarenessProtocol.removeAwarenessStates(this.awareness, [doc.clientID], 'window unload')
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('unload', this._unloadHandler)
    }
    // @ts-ignore
    else if (typeof process !== 'undefined') {
      // @ts-ignore
      process.on('exit', this._unloadHandler)
    }
    awareness.on('update', this._awarenessUpdateHandler)

    // @ts-ignore
    this._checkInterval = setInterval(() => {
      if (
        this.wsconnected &&
        messageReconnectTimeout < time.getUnixTime() - this.wsLastMessageReceived
      ) {
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        this.ws?.close()
      }
    }, messageReconnectTimeout / 10)
    if (connect) {
      this.connect()
    }
  }

  /**
   * @type {boolean}
   */
  get synced() {
    return this._synced
  }

  set synced(state) {
    if (this._synced !== state) {
      this._synced = state
      this.emit('synced', [state])
      this.emit('sync', [state])
    }
  }

  getSubDoc(id: string) {
    return this.subDocs.get(id)
  }

  destroy() {
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval)
    }
    clearInterval(this._checkInterval)
    this.disconnect()
    if (typeof window !== 'undefined') {
      window.removeEventListener('unload', this._unloadHandler)
    } else if (typeof process !== 'undefined') {
      process.off('exit', this._unloadHandler)
    }
    this.awareness.off('updateV2', this._awarenessUpdateHandler)
    this.subDocs.forEach(subDoc => {
      subDoc.off('updateV2', this._updateSubDocHandler)
      subDoc.destroy()
    })
    this.doc.off('subdocs', this._subDocsHandler)
    this.doc.off('updateV2', this._updateHandler)
    super.destroy()
  }

  connectBc() {
    if (this.disableBc) {
      return
    }
    if (!this.bcconnected) {
      bc.subscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = true
    }
    // send sync step1 to bc
    // write sync step 1
    const encoderSync = encoding.createEncoder()
    encoding.writeVarUint(encoderSync, messageSync)
    encoding.writeAny(encoderSync, {})
    syncProtocol.writeSyncStep1(encoderSync, this.doc)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderSync), this)
    // broadcast local state
    const encoderState = encoding.createEncoder()
    encoding.writeVarUint(encoderState, messageSync)
    encoding.writeAny(encoderState, {})
    syncProtocol.writeSyncStep2(encoderState, this.doc)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderState), this)
    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder()
    encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness)
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderAwarenessQuery), this)
    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder()
    encoding.writeVarUint(encoderAwarenessState, messageAwareness)
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.doc.clientID]),
    )
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderAwarenessState), this)
  }

  disconnectBc() {
    // broadcast message with local awareness state set to null (indicating disconnect)
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageAwareness)
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.doc.clientID], new Map()),
    )
    broadcastMessage(this, encoding.toUint8Array(encoder))
    if (this.bcconnected) {
      bc.unsubscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = false
    }
  }

  disconnect() {
    this.shouldConnect = false
    this.disconnectBc()
    if (this.ws !== null) {
      this.ws.close()
    }
  }

  connect() {
    this.shouldConnect = true
    if (!this.wsconnected && this.ws === null) {
      setupWS(this)
      this.connectBc()
    }
  }
}
