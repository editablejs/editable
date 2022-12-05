import React, { useCallback, useEffect, useMemo, useState } from 'react'
import tw, { css, styled } from 'twin.macro'
import {
  EditableProvider,
  ContentEditable,
  createEditor,
  useIsomorphicLayoutEffect,
  Placeholder,
  Editor,
  Descendant,
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
  UI,
} from '@editablejs/plugins'
import {
  withYHistory,
  withYjs,
  withCursors,
  YjsEditor,
  CursorData,
  useRemoteClientIds,
  CursorEditor,
} from '@editablejs/plugin-yjs'
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
import { Seo } from 'components/seo'
import { createGlobalStyle } from 'styled-components'
import { ExternalLink } from 'components/external-link'
import { IconGitHub } from 'components/icon/github'

const { Switch, SwitchThumb, Icon } = UI

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

const CustomStyles = createGlobalStyle({
  body: {
    ...tw`bg-gray-100`,
  },
})

const StyledHeader = tw.div`bg-white text-base`

const StyledToolbar = styled(Toolbar)`
  ${tw`flex justify-center border border-solid border-t-gray-200 border-b-gray-200 py-2 px-6 `}
`

const StyledContainer = tw.div`mt-5 min-h-[80vh] bg-white shadow w-[800px] m-auto px-10 py-16 text-sm leading-7`

const StyledSwitch = styled(Switch)(({ checked }) => {
  return [
    tw`relative shadow w-10 rounded-full bg-link`,
    css`
      background: ${checked ? '#44b492 !important;' : '#e2e8f0 !important;'};
    `,
  ]
})

const StyledSwitchThumb = styled(SwitchThumb)`
  ${tw`block w-5 h-5 rounded-full bg-white shadow`}
  transform: translateX(2px);
  will-change: transform;

  &[data-state='checked'] {
    transform: translateX(20px);
  }
`

export default function Playground() {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnection] = useState(false)
  const [enableCollaborative, setEnableCollaborative] = useState(false)
  const document = useMemo(() => new Y.Doc(), [])
  const provider = useMemo(
    () =>
      typeof window === 'undefined'
        ? null
        : new WebsocketProvider('ws://localhost:1234', 'editable', document),
    [document],
  )

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
    if (!provider) return
    const handleStatus = (event: Record<'status', 'connecting' | 'connected' | 'disconnected'>) => {
      const { status } = event
      if (status === 'connected') {
        setConnected(true)
        setConnection(false)
      } else if (status === 'connecting') {
        setConnection(true)
      } else if (status === 'disconnected') {
        setConnected(false)
        setConnection(false)
      }
    }
    if (enableCollaborative) {
      setConnection(true)
      provider.connect()
      provider.on('status', handleStatus)
    }
    return () => {
      provider.off('status', handleStatus)
      provider.disconnect()
    }
  }, [provider, enableCollaborative])

  useEffect(() => {
    if (connected) {
      YjsEditor.connect(editor, initialValue)
    }
    return () => YjsEditor.disconnect(editor)
  }, [editor, connected])

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

  const remoteClientIds = useRemoteClientIds(editor)

  return (
    <>
      <CustomStyles />
      <Seo title="Editable Playground" />
      <EditableProvider editor={editor}>
        <StyledHeader>
          <div tw="flex justify-between py-3 px-6 text-base">
            <ExternalLink
              aria-label="Editable on Github"
              href="https://github.com/editablejs/editable/blob/main/apps/docs/src/pages/playground.tsx"
              tw="text-2xl text-link flex-1"
            >
              <IconGitHub />
            </ExternalLink>
            <div tw="flex gap-1">
              {remoteClientIds.map(id => {
                const state = CursorEditor.cursorState<CursorData>(editor as CursorEditor, id)
                const { name } = state?.data ?? { name: 'unknown' }
                return <div key={id}>{name}</div>
              })}
              <div tw="flex items-center">
                <label htmlFor="collaboration-mode" tw="mr-2">
                  {connecting ? 'Connecting...' : connected ? 'Collaboration mode' : 'Local mode'}
                </label>
                {connecting && <Icon name="loading" />}
                {!connecting && (
                  <StyledSwitch
                    checked={enableCollaborative}
                    onCheckedChange={setEnableCollaborative}
                    id="collaboration-mode"
                  >
                    <StyledSwitchThumb />
                  </StyledSwitch>
                )}
              </div>
            </div>
          </div>
          <StyledToolbar />
        </StyledHeader>
        <StyledContainer>
          <ContentEditable placeholder="Please enter content..." />
        </StyledContainer>
      </EditableProvider>
    </>
  )
}
