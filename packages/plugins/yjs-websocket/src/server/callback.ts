/* eslint-disable turbo/no-undeclared-env-vars */
import http from 'http'
import { AbstractType } from 'yjs'
import { ContentType, WSSharedDoc } from './types'

export interface CallbackOptions {
  action: (data: Record<string, any>) => void
  timeout?: number
  objects?: Record<string, ContentType>
}

const callbackHandler = (doc: WSSharedDoc, options: CallbackOptions) => {
  const { action, timeout = 5000, objects = {} } = options
  const room = doc.name
  const dataToSend: Record<string, any> = {
    room,
    data: {},
  }
  const sharedObjectList = Object.keys(objects)
  sharedObjectList.forEach(sharedObjectName => {
    const sharedObjectType = objects[sharedObjectName]
    dataToSend.data[sharedObjectName] = {
      type: sharedObjectType,
      content: getContent(sharedObjectName, sharedObjectType, doc)?.toJSON() || {},
    }
  })
  if (typeof action === 'function') {
    action(dataToSend)
  } else {
    callbackRequest(action, timeout, dataToSend)
  }
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

export { callbackHandler }
