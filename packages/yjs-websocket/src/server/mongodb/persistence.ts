import * as Y from 'yjs'
import * as promise from 'lib0/promise'
import { MongoAdapter, MongoConnectionlOptions } from './adapter'
import * as U from './utils'
import { MongoClientOptions } from 'mongodb'

export interface MongoAdapterOptions {
  flushSize?: number
}

export class MongodbPersistence {
  flushSize: number
  tr: { [docName: string]: Promise<any> }
  private _transact: (docName: string, f: (adapter: MongoAdapter) => Promise<any>) => Promise<any>
  /**
   * Create a y-mongodb persistence instance.
   */
  constructor(
    url: string | MongoConnectionlOptions,
    { flushSize = 400 }: MongoAdapterOptions = {},
    clientOptions?: MongoClientOptions,
  ) {
    const db = new MongoAdapter(url, clientOptions)
    this.flushSize = flushSize ?? U.PREFERRED_TRIM_SIZE

    // scope the queue of the transaction to each docName
    // -> this should allow concurrency for different rooms
    // Idea and adjusted code from: https://github.com/fadiquader/y-mongodb/issues/10
    this.tr = {}

    /**
     * Execute an transaction on a database. This will ensure that other processes are
     * currently not writing.
     *
     * This is a private method and might change in the future.
     */
    this._transact = (docName: string, f: <T>(adapter: MongoAdapter) => Promise<T>) => {
      if (!this.tr[docName]) {
        this.tr[docName] = promise.resolve()
      }

      const currTr = this.tr[docName]

      this.tr[docName] = (async () => {
        await currTr

        let res = null
        try {
          res = await f(db)
        } catch (err) {
          console.warn('Error during saving transaction', err)
        }
        return res
      })()
      return this.tr[docName]
    }
  }

  /**
   * Create a Y.Doc instance with the data persistet in mongodb.
   * Use this to temporarily create a Yjs document to sync changes or extract data.
   */
  getYDoc(docName: string): Promise<Y.Doc> {
    return this._transact(docName, async (db: MongoAdapter) => {
      const updates = await U.getMongoUpdates(db, docName)
      const ydoc = new Y.Doc()
      ydoc.transact(() => {
        for (let i = 0; i < updates.length; i++) {
          Y.applyUpdate(ydoc, updates[i])
        }
      })
      if (updates.length > this.flushSize) {
        await U.flushDocument(db, docName, Y.encodeStateAsUpdate(ydoc), Y.encodeStateVector(ydoc))
      }
      return ydoc
    })
  }

  /**
   * Store a single document update to the database.
   */
  storeUpdate(docName: string, update: Uint8Array): Promise<number> {
    return this._transact(docName, db => U.storeUpdate(db, docName, update))
  }

  /**
   * The state vector (describing the state of the persisted document - see https://github.com/yjs/yjs#Document-Updates) is maintained in a separate field and constantly updated.
   *
   * This allows you to sync changes without actually creating a Yjs document.
   *
   */
  getStateVector(docName: string) {
    return this._transact(docName, async db => {
      const { clock, sv } = await U.readStateVector(db, docName)
      let curClock = -1
      if (sv !== null) {
        curClock = await U.getCurrentUpdateClock(db, docName)
      }
      if (sv !== null && clock === curClock) {
        return sv
      } else {
        // current state vector is outdated
        const updates = await U.getMongoUpdates(db, docName)
        const { update, sv: newSv } = U.mergeUpdates(updates)
        await U.flushDocument(db, docName, update, newSv)
        return newSv
      }
    })
  }

  /**
   * Get the differences directly from the database.
   * The same as Y.encodeStateAsUpdate(ydoc, stateVector).
   */
  async getDiff(docName: string, stateVector: Uint8Array) {
    const ydoc = await this.getYDoc(docName)
    return Y.encodeStateAsUpdate(ydoc, stateVector)
  }

  /**
   * Delete a document, and all associated data from the database.
   * When option multipleCollections is set, it removes the corresponding collection
   */
  clearDocument(docName: string) {
    return this._transact(docName, async db => {
      await db.dropCollection(docName)
    })
  }

  /**
   * Persist some meta information in the database and associate it
   * with a document. It is up to you what you store here.
   * You could, for example, store credentials here.
   */
  setMeta(docName: string, metaKey: string, value: any) {
    /*	Unlike y-leveldb, we simply store the value here without encoding
	 		 it in a buffer beforehand. */
    return this._transact(docName, async db => {
      await db.put(U.createDocumentMetaKey(docName, metaKey), { value })
    })
  }

  /**
   * Retrieve a store meta value from the database. Returns undefined if the
   * metaKey doesn't exist.
   */
  getMeta(docName: string, metaKey: string): Promise<any> {
    return this._transact(docName, async db => {
      const res = await db.get({ ...U.createDocumentMetaKey(docName, metaKey) })
      if (!res?.value) {
        return undefined
      }
      return res.value
    })
  }

  /**
   * Delete a store meta value.
   */
  delMeta(docName: string, metaKey: string): Promise<any> {
    return this._transact(docName, db =>
      db.del({
        ...U.createDocumentMetaKey(docName, metaKey),
      }),
    )
  }

  /**
   * Retrieve the names of all stored documents.
   */
  getAllDocNames() {
    return this._transact('global', async db => {
      return db.getCollectionNames()
    })
  }

  /**
   * Internally y-mongodb stores incremental updates. You can merge all document
   * updates to a single entry. You probably never have to use this.
   * It is done automatically every $options.flushsize (default 400) transactions.
   */
  flushDocument(docName: string) {
    return this._transact(docName, async db => {
      const updates = await U.getMongoUpdates(db, docName)
      const { update, sv } = U.mergeUpdates(updates)
      await U.flushDocument(db, docName, update, sv)
    })
  }

  /**
   * Delete the whole yjs mongodb
   */
  flushDB() {
    return this._transact('global', async db => {
      await U.flushDB(db)
    })
  }
}
