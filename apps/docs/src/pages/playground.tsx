import React, { useCallback, useEffect, useMemo, useState } from 'react'
import tw, { styled } from 'twin.macro'
import {
  EditableProvider,
  ContentEditable,
  createEditor,
  useIsomorphicLayoutEffect,
  Placeholder,
  Editor,
  Descendant,
  Editable,
} from '@editablejs/editor'
import {
  withPlugins,
  withSideToolbar,
  withInlineToolbar,
  withToolbar,
  useContextMenuEffect,
  useInlineToolbarEffect,
  ContextMenuStore,
  ToolbarStore,
  useSideToolbarMenuEffect,
} from '@editablejs/plugins'
import { withYHistory, withYjs, withCursors, YjsEditor, CursorData } from '@editablejs/plugin-yjs'
import randomColor from 'randomcolor'
import { faker } from '@faker-js/faker'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { withHTMLSerializer, withTextSerializer } from '@editablejs/plugins/serializer'
import { withHTMLDeserializer } from '@editablejs/plugins/deserializer'
import { Toolbar } from '../components/toolbar'
import { createContextMenuItems } from '../configs/context-menu-items'
import { createToolbarItems } from '../configs/toolbar-items'
import { createSideToolbarItems } from '../configs/side-toolbar-items'

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

export default function Playground() {
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
    editor = withYHistory(
      withSideToolbar(
        withInlineToolbar(
          withToolbar(
            withPlugins(editor, {
              fontSize: { defaultSize: '14px' },
            }),
          ),
        ),
      ),
    )
    Placeholder.add(editor, {
      check: entry => {
        return Editor.isBlock(editor, entry[0])
      },
      render: () => {
        return 'Enter some text...'
      },
    })
    return editor
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

  useIsomorphicLayoutEffect(() => {
    withHTMLSerializer(editor)
    withHTMLDeserializer(editor)
    withTextSerializer(editor)
  }, [editor])

  useContextMenuEffect(() => {
    ContextMenuStore.setItems(editor, createContextMenuItems(editor))
  }, editor)

  useInlineToolbarEffect(() => {
    ToolbarStore.setInlineItems(editor, createToolbarItems(editor))
  }, editor)

  useSideToolbarMenuEffect((...a) => {
    ToolbarStore.setSideMenuItems(editor, createSideToolbarItems(editor, ...a))
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
