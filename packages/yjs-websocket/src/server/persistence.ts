import { editorElementToYText } from '@editablejs/yjs-transform'
import { Element } from '@editablejs/models'
import { LeveldbPersistence } from 'y-leveldb'
import * as Y from 'yjs'
import { WSSharedDoc } from './types'
import { MongoAdapterOptions, MongodbPersistence } from './mongodb/persistence'
import { MongoConnectionlOptions } from './mongodb/adapter'
import { MongoClientOptions } from 'mongodb'

type PersistenceProvider = LeveldbPersistence | MongodbPersistence

interface Persistence {
  bindState: (docname: string, doc: WSSharedDoc, initialValue?: Element) => void
  writeState: (docname: string, doc: WSSharedDoc, element?: Element) => Promise<void>
  provider: PersistenceProvider
}

let persistence: null | Persistence = null

interface PersistenceBaseOptions {
  provider: 'leveldb' | 'mongodb'
}

export interface LeveldbPersistenceOptions extends PersistenceBaseOptions {
  provider: 'leveldb'
  dir?: string
}

export interface MongodbPersistenceOptions
  extends PersistenceBaseOptions,
    MongoAdapterOptions,
    MongoClientOptions {
  provider: 'mongodb'
  url: string | MongoConnectionlOptions
}

export type PersistenceOptions = LeveldbPersistenceOptions | MongodbPersistenceOptions

export const initPersistence = async (options: PersistenceOptions, contentField = 'content') => {
  let ldb: PersistenceProvider | null = null
  const { provider, ...others } = options
  if (provider === 'leveldb') {
    const { dir = './db' } = others as LeveldbPersistenceOptions
    console.info('Persisting documents to "' + dir + '"')
    ldb = new LeveldbPersistence(dir)
  } else if (provider === 'mongodb') {
    const { url, flushSize, ...opts } = others as Omit<MongodbPersistenceOptions, 'provider'>
    ldb = new MongodbPersistence(url, { flushSize }, opts)

    console.info('Persisting documents to mongodb')
  }
  if (!ldb) throw new Error('No persistence provider found')

  persistence = {
    provider: ldb,
    bindState: async (
      docName,
      ydoc,
      initialValue = {
        children: [{ text: '' }],
      },
    ) => {
      const persistedYdoc = await ldb!.getYDoc(docName)
      const newUpdates = Y.encodeStateAsUpdate(ydoc)
      ldb!.storeUpdate(docName, newUpdates)
      const content = persistedYdoc.get(contentField, Y.XmlText) as Y.XmlText
      const updateContent = ydoc.get(contentField, Y.XmlText) as Y.XmlText

      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
      ydoc.on('update', update => {
        ldb!.storeUpdate(docName, update)
      })

      // init empty content
      if (content._length === 0 && updateContent._length === 0) {
        ydoc.transact(() => {
          updateContent.insertEmbed(0, editorElementToYText(initialValue))
        })
      }
    },
    writeState: async (docName, ydoc) => {
      // This is called when all connections to the document are closed.
      // In the future, this method might also be called in intervals or after a certain number of updates.
      return new Promise(resolve => {
        // When the returned Promise resolves, the document will be destroyed.
        // So make sure that the document really has been written to the database.
        resolve()
      })
    },
  }
}

export const setPersistence = (persistence_: Persistence | null) => {
  persistence = persistence_
}

export const getPersistence = (): null | Persistence => persistence
