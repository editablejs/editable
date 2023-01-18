import { Editable } from '@editablejs/editor'
import { Observable } from 'lib0/observable'

const CONNECTED: WeakSet<Editable> = new WeakSet()
export interface ProviderProtocol {
  connect: () => void
  disconnect: () => void
  connected: () => boolean
  on: Observable<'connected' | 'disconnected'>['on']
  off: Observable<'connected' | 'disconnected'>['off']
}

const PROVIDERS: WeakMap<Editable, ProviderProtocol> = new WeakMap()
export const ProviderProtocol = {
  connect: (providerProtocol: ProviderProtocol) => {
    providerProtocol.connect()
  },

  disconnect: (providerProtocol: ProviderProtocol) => {
    providerProtocol.disconnect()
  },

  connected: (providerProtocol: ProviderProtocol) => {
    providerProtocol.connected()
  },
}

export const createProviderProtocol = (editor: Editable): ProviderProtocol => {
  const observable = new Observable<'connected' | 'disconnected'>()
  const providerProtocol = {
    connect: () => {
      if (providerProtocol.connected()) {
        throw new Error('already connected')
      }
      CONNECTED.add(editor)
      observable.emit('connected', [editor])
    },
    disconnect: () => {
      CONNECTED.delete(editor)
      observable.emit('disconnected', [editor])
    },
    connected: () => {
      return CONNECTED.has(editor)
    },
    on: (event: 'connected' | 'disconnected', handler: (editor: Editable) => void) => {
      observable.on(event, handler)
    },
    off: (event: 'connected' | 'disconnected', handler: (editor: Editable) => void) => {
      observable.off(event, handler)
    },
  }
  return providerProtocol
}

export const useProviderProtocol = (editor: Editable) => {
  let providerProtocol = PROVIDERS.get(editor)
  if (!providerProtocol) {
    providerProtocol = createProviderProtocol(editor)
    PROVIDERS.set(editor, providerProtocol)
  }
  return providerProtocol
}
