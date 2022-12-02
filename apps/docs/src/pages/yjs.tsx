import { EditableProvider, ContentEditable, createEditor, Descendant } from '@editablejs/editor'
import {
  withInlineToolbar,
  withPlugins,
  withToolbar,
  useContextMenuEffect,
  useInlineToolbarEffect,
  ContextMenuStore,
  ToolbarStore,
} from '@editablejs/plugins'
import { withYHistory, withYjs, withCursors, YjsEditor, CursorData } from '@editablejs/plugin-yjs'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import randomColor from 'randomcolor'
import { faker } from '@faker-js/faker'
import tw, { styled } from 'twin.macro'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { createContextMenuItems } from '../configs/context-menu-items'
import { createToolbarItems } from '../configs/toolbar-items'
import { Toolbar } from '../components/toolbar'

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

const StyledWrapper = styled.div`
  cursor: default;
  width: 600px;
  margin: 60px auto;
`

const StyledContainer = tw.div`mt-5`

export default function Docs() {
  const [value, setValue] = useState<Descendant[]>([])
  const [connected, setConnected] = useState(false)
  const document = useMemo(() => new Y.Doc(), [])
  const provider = useMemo(
    () =>
      typeof window === 'undefined'
        ? null
        : new WebsocketProvider('ws://localhost:1234', 'editablejs', document),
    [document],
  )

  const toggleConnection = useCallback(() => {
    if (!provider) return
    if (connected) {
      return provider.disconnect()
    }

    provider.connect()
  }, [provider, connected])

  const editor = useMemo(() => {
    const { name } = faker
    const cursorData: CursorData = {
      color: randomColor({
        luminosity: 'dark',
        alpha: 1,
        format: 'hex',
      }),
      name: `${name.firstName()} ${name.lastName()}`,
    }

    const sharedType = document.get('content', Y.XmlText) as Y.XmlText

    let editor = withYjs(createEditor(), sharedType, { autoConnect: false })
    if (provider) {
      editor = withCursors(editor, provider.awareness, {
        data: cursorData,
      })
    }

    return withInlineToolbar(
      withToolbar(
        withPlugins(withYHistory(editor), {
          fontSize: { defaultSize: '14px' },
        }),
      ),
    )
  }, [document, provider])

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

  useContextMenuEffect(() => {
    ContextMenuStore.setItems(editor, createContextMenuItems(editor))
  }, editor)

  useInlineToolbarEffect(() => {
    ToolbarStore.setInlineItems(editor, createToolbarItems(editor))
  }, editor)

  return (
    <StyledWrapper>
      <EditableProvider editor={editor} defaultValue={initialValue}>
        <Toolbar />
        <StyledContainer>
          <ContentEditable placeholder="Please enter content..." />
        </StyledContainer>
      </EditableProvider>
    </StyledWrapper>
  )
}
