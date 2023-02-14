import { Db, MongoClient, MongoClientOptions } from 'mongodb'

export interface MongoConnectionlOptions {
  user?: string
  password?: string
  dbName?: string
  host?: string
}

export interface MongoCommandOptions {
  docName: string
}

export class MongoAdapter {
  client?: MongoClient
  db?: Db
  options: MongoClientOptions
  connectionString: string

  constructor(url: string | MongoConnectionlOptions, options: MongoClientOptions = {}) {
    if (typeof url === 'object') {
      const { user, password: pwd, dbName: db, host } = url
      url = user ? `mongodb://${user}:${pwd}@${host}` : `mongodb://${host}`
      url += db ? `/${db}` : ''
    }
    this.connectionString = url
    this.options = options
  }

  async connect() {
    if (this.db) return this.db
    const client = await MongoClient.connect(this.connectionString, this.options)
    this.db = client.db()
    return this.db
  }

  async collection(name: string) {
    const client = await this.connect()
    return client.collection(name)
  }

  async get<T extends MongoCommandOptions>(query: T) {
    const doc = await this.collection(query.docName)
    return doc.findOne(query)
  }

  async put<T extends MongoCommandOptions>(query: T, values: object) {
    const doc = await this.collection(query.docName)
    const { value: document } = await doc.findOneAndUpdate(
      query,
      { $set: { ...query, ...values } },
      { upsert: true, returnDocument: 'after' },
    )
    return document
  }

  async del<T extends MongoCommandOptions>(query: T) {
    const doc = await this.collection(query.docName)
    return doc.deleteMany(query)
  }

  async readAsCursor<T extends MongoCommandOptions>(
    query: T,
    { limit, reverse }: { limit?: number; reverse?: boolean } = {},
  ) {
    const doc = await this.collection(query.docName)
    let curs = doc.find(query)
    if (reverse) curs = curs.sort({ clock: -1 })
    if (limit) curs = curs.limit(limit)
    return curs.toArray()
  }

  /**
   * Close connection to MongoDB instance.
   */
  close() {
    this.client?.close()
  }

  async getCollectionNames() {
    const collections = (await this.db?.listCollections().toArray()) ?? []
    return collections.map(({ name }) => name)
  }

  /**
   * Delete database
   */
  async flush() {
    await this.db?.dropDatabase()
    await this.client?.close()
  }

  async dropCollection(collectionName: string) {
    const doc = await this.collection(collectionName)
    return doc.drop()
  }
}
