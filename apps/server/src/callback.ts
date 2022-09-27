/* eslint-disable turbo/no-undeclared-env-vars */
import http from 'http'
import { AbstractType } from 'yjs'
import { WSSharedDoc } from './types'

const CALLBACK_URL = process.env.CALLBACK_URL ? new URL(process.env.CALLBACK_URL) : null
const CALLBACK_TIMEOUT = parseInt(process.env.CALLBACK_TIMEOUT ?? '0', 10) || 5000
const CALLBACK_OBJECTS = process.env.CALLBACK_OBJECTS
  ? JSON.parse(process.env.CALLBACK_OBJECTS)
  : {}

const isCallbackSet = !!CALLBACK_URL

const callbackHandler = (update: Uint8Array, origin: string, doc: WSSharedDoc) => {
  const room = doc.name
  const dataToSend: Record<string, any> = {
    room,
    data: {},
  }
  const sharedObjectList = Object.keys(CALLBACK_OBJECTS)
  sharedObjectList.forEach(sharedObjectName => {
    const sharedObjectType = CALLBACK_OBJECTS[sharedObjectName]
    dataToSend.data[sharedObjectName] = {
      type: sharedObjectType,
      content: getContent(sharedObjectName, sharedObjectType, doc)?.toJSON() || {},
    }
  })
  if (CALLBACK_URL) callbackRequest(CALLBACK_URL, CALLBACK_TIMEOUT, dataToSend)
}

const callbackRequest = (url: URL, timeout: number, data: any) => {
  data = JSON.stringify(data)
  const options: http.RequestOptions = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    timeout,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  }
  const req = http.request(options)
  req.on('timeout', () => {
    console.warn('Callback request timed out.')
    req.abort()
  })
  req.on('error', e => {
    console.error('Callback request error.', e)
    req.abort()
  })
  req.write(data)
  req.end()
}

type ContentType = 'Array' | 'Map' | 'Text' | 'XmlFragment'

const getContent = (
  objName: string,
  objType: ContentType,
  doc: WSSharedDoc,
): AbstractType<any> | null => {
  switch (objType) {
    case 'Array':
      return doc.getArray(objName)
    case 'Map':
      return doc.getMap(objName)
    case 'Text':
      return doc.getText(objName)
    case 'XmlFragment':
      return doc.getXmlFragment(objName)
    default:
      return null
  }
}

export { isCallbackSet, callbackHandler }
