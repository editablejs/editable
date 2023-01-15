import { slateElementToYText, Element } from '@editablejs/plugin-yjs-transform'
import { LeveldbPersistence } from 'y-leveldb'
import * as Y from 'yjs'
import { WSSharedDoc } from './types'

interface Persistence {
  bindState: (docname: string, doc: WSSharedDoc, initialValue?: Element) => void
  writeState: (docname: string, doc: WSSharedDoc, element?: Element) => Promise<void>
  provider: LeveldbPersistence
}

let persistence: null | Persistence = null

export const initPersistence = async (dir: string = './db', contentField = 'content') => {
  console.info('Persisting documents to "' + dir + '"')
  const ldb = new LeveldbPersistence(dir)
  persistence = {
    provider: ldb,
    bindState: async (
      docName,
      ydoc,
      initialValue = {
        children: [{ text: '' }],
      },
    ) => {
      const persistedYdoc = await ldb.getYDoc(docName)
      const newUpdates = Y.encodeStateAsUpdate(ydoc)
      ldb.storeUpdate(docName, newUpdates)
      const content = persistedYdoc.get(contentField, Y.XmlText) as Y.XmlText
      const updateContent = ydoc.get(contentField, Y.XmlText) as Y.XmlText

      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
      ydoc.on('update', update => {
        ldb.storeUpdate(docName, update)
      })

      // init empty content
      if (content._length === 0 && updateContent._length === 0) {
        ydoc.transact(() => {
          updateContent.insertEmbed(0, slateElementToYText(initialValue))
        })
      }
    },
    writeState: async (docName, ydoc) => {},
  }
}

export const setPersistence = (persistence_: Persistence | null) => {
  persistence = persistence_
}

export const getPersistence = (): null | Persistence => persistence
