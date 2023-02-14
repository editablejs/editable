import * as Y from 'yjs'
import * as binary from 'lib0/binary'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import { Buffer } from 'buffer'
import { MongoAdapter, MongoCommandOptions } from './adapter'
import { WithId, Document } from 'mongodb'

export const PREFERRED_TRIM_SIZE = 400

/**
 * Remove all documents from db with Clock between $from and $to
 */
export const clearUpdatesRange = async (
  adapter: MongoAdapter,
  docName: string,
  from: number,
  to: number,
): Promise<void> => {
  adapter.del({
    docName,
    clock: {
      $gte: from,
      $lt: to,
    },
  })
}

/**
 * Create a unique key for a update message.
 */
export const createDocumentUpdateKey = (docName: string, clock?: number) => {
  if (clock !== undefined) {
    return {
      version: 'v1',
      action: 'update',
      docName,
      clock,
    }
  } else {
    return {
      version: 'v1',
      action: 'update',
      docName,
    }
  }
}

/**
 * We have a separate state vector key so we can iterate efficiently over all documents
 */
export const createDocumentStateVectorKey = (docName: string) => ({
  docName,
  version: 'v1_sv',
})

export const createDocumentMetaKey = (docName: string, metaKey: string) => ({
  version: 'v1',
  docName,
  metaKey: `meta_${metaKey}`,
})

export const getMongoBulkData = <T extends MongoCommandOptions>(
  adapter: MongoAdapter,
  query: T,
  opts: object,
) => adapter.readAsCursor(query, opts)

export const flushDB = (adapter: MongoAdapter): Promise<any> => adapter.flush()

/**
 * Convert the mongo document array to an array of values (as buffers)
 */
const _convertMongoUpdates = (docs: WithId<Document>[]) => {
  if (!Array.isArray(docs) || !docs.length) return []

  return docs.map(update => update.value.buffer)
}
/**
 * Get all document updates for a specific document.
 */
export const getMongoUpdates = async (adapter: MongoAdapter, docName: string, opts: any = {}) => {
  const docs = await getMongoBulkData(adapter, createDocumentUpdateKey(docName), opts)
  return _convertMongoUpdates(docs)
}

export const getCurrentUpdateClock = (adapter: MongoAdapter, docName: string): Promise<number> =>
  getMongoBulkData(
    adapter,
    {
      ...createDocumentUpdateKey(docName, 0),
      clock: {
        $gte: 0,
        $lt: binary.BITS32,
      },
    },
    { reverse: true, limit: 1 },
  ).then(updates => {
    if (updates.length === 0) {
      return -1
    } else {
      return updates[0].clock
    }
  })

export const writeStateVector = async (
  adapter: MongoAdapter,
  docName: string,
  sv: Uint8Array,
  clock: number,
) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, clock)
  encoding.writeVarUint8Array(encoder, sv)
  await adapter.put(createDocumentStateVectorKey(docName), {
    value: Buffer.from(encoding.toUint8Array(encoder)),
  })
}

export const storeUpdate = async (
  adapter: MongoAdapter,
  docName: string,
  update: Uint8Array,
): Promise<number> => {
  const clock = await getCurrentUpdateClock(adapter, docName)
  if (clock === -1) {
    // make sure that a state vector is always written, so we can search for available documents
    const ydoc = new Y.Doc()
    Y.applyUpdate(ydoc, update)
    const sv = Y.encodeStateVector(ydoc)
    await writeStateVector(adapter, docName, sv, 0)
  }

  await adapter.put(createDocumentUpdateKey(docName, clock + 1), {
    value: Buffer.from(update),
  })

  return clock + 1
}

/**
 * For now this is a helper method that creates a Y.Doc and then re-encodes a document update.
 * In the future this will be handled by Yjs without creating a Y.Doc (constant memory consumption).
 */
export const mergeUpdates = (
  updates: Array<Uint8Array>,
): { update: Uint8Array; sv: Uint8Array } => {
  const ydoc = new Y.Doc()
  ydoc.transact(() => {
    for (let i = 0; i < updates.length; i++) {
      Y.applyUpdate(ydoc, updates[i])
    }
  })
  return { update: Y.encodeStateAsUpdate(ydoc), sv: Y.encodeStateVector(ydoc) }
}

export const decodeMongodbStateVector = (buf: Uint8Array): { sv: Uint8Array; clock: number } => {
  let decoder
  if (Buffer.isBuffer(buf)) {
    decoder = decoding.createDecoder(buf)
  } else if (Buffer.isBuffer(buf?.buffer)) {
    decoder = decoding.createDecoder(buf.buffer)
  } else {
    throw new Error('No buffer provided at decodeMongodbStateVector()')
  }
  const clock = decoding.readVarUint(decoder)
  const sv = decoding.readVarUint8Array(decoder)
  return { sv, clock }
}

export const readStateVector = async (adapter: MongoAdapter, docName: string) => {
  const doc = await adapter.get({ ...createDocumentStateVectorKey(docName) })
  if (!doc?.value) {
    // no state vector created yet or no document exists
    return { sv: null, clock: -1 }
  }
  return decodeMongodbStateVector(doc.value)
}

/**
 * Merge all MongoDB documents of the same yjs document together.
 */
export const flushDocument = async (
  adapter: MongoAdapter,
  docName: string,
  stateAsUpdate: Uint8Array,
  stateVector: Uint8Array,
): Promise<number> => {
  const clock = await storeUpdate(adapter, docName, stateAsUpdate)
  await writeStateVector(adapter, docName, stateVector, clock)
  await clearUpdatesRange(adapter, docName, 0, clock)
  return clock
}
