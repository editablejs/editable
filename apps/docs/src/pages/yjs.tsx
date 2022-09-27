import {
  EditableComposer,
  ContentEditable,
  createEditor,
  Descendant,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import { Toolbar, withPlugins } from '@editablejs/plugins'
import { withYHistory, withYjs, YjsEditor } from '@editablejs/plugin-yjs'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './index.module.css'
import { defaultToolbarConfig } from '../toolbar-config'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Hello, ',
      },
      {
        text: 'This',
        fontSize: '28px',
      },
      {
        text: ' is a Paragraph',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'A line of text in a paragraph.',
      },
    ],
  },
]

export default function Docs() {
  const [value, setValue] = useState<Descendant[]>([])
  const [connected, setConnected] = useState(false)
  const document = useMemo(() => new Y.Doc(), [])
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  useIsomorphicLayoutEffect(() => {
    const provider = new WebsocketProvider('ws://localhost:1234', 'editablejs', document)
    provider.on('status', (event: any) => {
      setConnected(event.status === 'connected')
    })
    setProvider(provider)
  }, [document])

  const toggleConnection = useCallback(() => {
    if (!provider) return
    if (connected) {
      return provider.disconnect()
    }

    provider.connect()
  }, [provider, connected])

  const editor = useMemo(() => {
    const sharedType = document.get('content', Y.XmlText) as Y.XmlText

    return withPlugins(withYHistory(withYjs(createEditor(), sharedType, { autoConnect: false })), {
      'font-size': { defaultSize: '14px' },
    })
  }, [document])

  // Connect editor and provider in useEffect to comply with concurrent mode
  // requirements.
  useEffect(() => {
    provider?.connect()
    return () => provider?.disconnect()
  }, [provider])

  useEffect(() => {
    YjsEditor.connect(editor as any)
    return () => YjsEditor.disconnect(editor as any)
  }, [editor])

  return (
    <div className={styles.wrapper}>
      <EditableComposer editor={editor} value={initialValue}>
        <Toolbar className={styles.toolbar} items={defaultToolbarConfig} />
        <div className={styles.container}>
          <ContentEditable placeholder="Please enter content..." />
        </div>
      </EditableComposer>
    </div>
  )
}
