/**
 * @module awareness-protocol
 */

import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as time from 'lib0/time'
import * as math from 'lib0/math'
import { Observable } from 'lib0/observable'
import * as f from 'lib0/function'
import * as Y from 'yjs'

export const outdatedTimeout = 30000

export interface MetaClientState {
  clock: number
  // unix timestamp
  lastUpdated: number
}

/**
 * The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
 * (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
 * remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
 *
 * Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
 * its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
 * applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
 * a remote client is offline, it may propagate a message with
 * `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
 * message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
 *
 * Before a client disconnects, it should propagate a `null` state with an updated clock.
 *
 * Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
 *
 */
export class Awareness extends Observable<string> {
  doc: Y.Doc
  clientID: number
  states: Map<number, Record<string, any>>
  meta: Map<number, MetaClientState>
  _checkInterval: number
  /**
   * @param {Y.Doc} doc
   */
  constructor(doc: Y.Doc) {
    super()
    this.doc = doc

    this.clientID = doc.clientID
    /**
     * Maps from client id to client state
     */
    this.states = new Map()

    this.meta = new Map()
    this._checkInterval = setInterval(() => {
      const now = time.getUnixTime()
      if (
        this.getLocalState() !== null &&
        outdatedTimeout / 2 <= now - (this.meta.get(this.clientID)?.lastUpdated ?? 0)
      ) {
        // renew local clock
        this.setLocalState(this.getLocalState())
      }

      const remove: number[] = []
      this.meta.forEach((meta: { lastUpdated: number }, clientid: number) => {
        if (
          clientid !== this.clientID &&
          outdatedTimeout <= now - meta.lastUpdated &&
          this.states.has(clientid)
        ) {
          remove.push(clientid)
        }
      })
      if (remove.length > 0) {
        removeAwarenessStates(this, remove, 'timeout')
      }
    }, math.floor(outdatedTimeout / 10))
    doc.on('destroy', () => {
      this.destroy()
    })
    this.setLocalState({})
  }

  destroy() {
    this.emit('destroy', [this])
    this.setLocalState(null)
    super.destroy()
    clearInterval(this._checkInterval)
  }

  getLocalState() {
    return this.states.get(this.clientID) || null
  }

  setLocalState(state: Record<string, any> | null) {
    const clientID = this.clientID
    const currLocalMeta = this.meta.get(clientID)
    const clock = currLocalMeta === undefined ? 0 : currLocalMeta.clock + 1
    const prevState = this.states.get(clientID)
    if (state === null) {
      this.states.delete(clientID)
    } else {
      this.states.set(clientID, state)
    }
    this.meta.set(clientID, {
      clock,
      lastUpdated: time.getUnixTime(),
    })
    const added = []
    const updated = []
    const filteredUpdated = []
    const removed = []
    if (state === null) {
      removed.push(clientID)
    } else if (prevState == null) {
      if (state != null) {
        added.push(clientID)
      }
    } else {
      updated.push(clientID)
      if (!f.equalityDeep(prevState, state)) {
        filteredUpdated.push(clientID)
      }
    }
    if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
      this.emit('change', [{ added, updated: filteredUpdated, removed }, 'local'])
    }
    this.emit('update', [{ added, updated, removed }, 'local'])
  }

  setLocalStateField(field: string, value: any) {
    const state = this.getLocalState()
    if (state !== null) {
      this.setLocalState({
        ...state,
        [field]: value,
      })
    }
  }

  getStates(): Map<number, Record<string, any>> {
    return this.states
  }
}

/**
 * Mark (remote) clients as inactive and remove them from the list of active peers.
 * This change will be propagated to remote clients.
 *
 * @param awareness
 * @param clients
 * @param origin
 */
export const removeAwarenessStates = (awareness: Awareness, clients: number[], origin: any) => {
  const removed = []
  for (let i = 0; i < clients.length; i++) {
    const clientID = clients[i]
    if (awareness.states.has(clientID)) {
      awareness.states.delete(clientID)
      if (clientID === awareness.clientID) {
        const curMeta = awareness.meta.get(clientID)
        awareness.meta.set(clientID, {
          clock: (curMeta?.clock ?? 0) + 1,
          lastUpdated: time.getUnixTime(),
        })
      }
      removed.push(clientID)
    }
  }
  if (removed.length > 0) {
    awareness.emit('change', [{ added: [], updated: [], removed }, origin])
    awareness.emit('update', [{ added: [], updated: [], removed }, origin])
  }
}

/**
 * @param awareness
 * @param clients
 * @return
 */
export const encodeAwarenessUpdate = (
  awareness: Awareness,
  clients: number[],
  states = awareness.states,
): Uint8Array => {
  const len = clients.length
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, len)
  for (let i = 0; i < len; i++) {
    const clientID = clients[i]
    const state = states.get(clientID) || null
    const clock = awareness.meta.get(clientID)?.clock ?? 0
    encoding.writeVarUint(encoder, clientID)
    encoding.writeVarUint(encoder, clock)
    encoding.writeVarString(encoder, JSON.stringify(state))
  }
  return encoding.toUint8Array(encoder)
}

/**
 * Modify the content of an awareness update before re-encoding it to an awareness update.
 *
 * This might be useful when you have a central server that wants to ensure that clients
 * cant hijack somebody elses identity.
 *
 * @param update
 * @param modify
 * @return
 */
export const modifyAwarenessUpdate = (
  update: Uint8Array,
  modify: (arg0: any) => any,
): Uint8Array => {
  const decoder = decoding.createDecoder(update)
  const encoder = encoding.createEncoder()
  const len = decoding.readVarUint(decoder)
  encoding.writeVarUint(encoder, len)
  for (let i = 0; i < len; i++) {
    const clientID = decoding.readVarUint(decoder)
    const clock = decoding.readVarUint(decoder)
    const state = JSON.parse(decoding.readVarString(decoder))
    const modifiedState = modify(state)
    encoding.writeVarUint(encoder, clientID)
    encoding.writeVarUint(encoder, clock)
    encoding.writeVarString(encoder, JSON.stringify(modifiedState))
  }
  return encoding.toUint8Array(encoder)
}

/**
 * @param awareness
 * @param update
 * @param origin This will be added to the emitted change event
 */
export const applyAwarenessUpdate = (awareness: Awareness, update: Uint8Array, origin: any) => {
  const decoder = decoding.createDecoder(update)
  const timestamp = time.getUnixTime()
  const added = []
  const updated = []
  const filteredUpdated = []
  const removed = []
  const len = decoding.readVarUint(decoder)
  for (let i = 0; i < len; i++) {
    const clientID = decoding.readVarUint(decoder)
    let clock = decoding.readVarUint(decoder)
    const state = JSON.parse(decoding.readVarString(decoder))
    const clientMeta = awareness.meta.get(clientID)
    const prevState = awareness.states.get(clientID)
    const currClock = clientMeta === undefined ? 0 : clientMeta.clock
    if (
      currClock < clock ||
      (currClock === clock && state === null && awareness.states.has(clientID))
    ) {
      if (state === null) {
        // never let a remote client remove this local state
        if (clientID === awareness.clientID && awareness.getLocalState() != null) {
          // remote client removed the local state. Do not remote state. Broadcast a message indicating
          // that this client still exists by increasing the clock
          clock++
        } else {
          awareness.states.delete(clientID)
        }
      } else {
        awareness.states.set(clientID, state)
      }
      awareness.meta.set(clientID, {
        clock,
        lastUpdated: timestamp,
      })
      if (clientMeta === undefined && state !== null) {
        added.push(clientID)
      } else if (clientMeta !== undefined && state === null) {
        removed.push(clientID)
      } else if (state !== null) {
        if (!f.equalityDeep(state, prevState)) {
          filteredUpdated.push(clientID)
        }
        updated.push(clientID)
      }
    }
  }
  if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
    awareness.emit('change', [
      {
        added,
        updated: filteredUpdated,
        removed,
      },
      origin,
    ])
  }
  if (added.length > 0 || updated.length > 0 || removed.length > 0) {
    awareness.emit('update', [
      {
        added,
        updated,
        removed,
      },
      origin,
    ])
  }
}
