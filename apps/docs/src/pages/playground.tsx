import * as React from 'react'
import NextLink from 'next/link'
import tw, { css, styled } from 'twin.macro'
import {
  EditableProvider,
  ContentEditable,
  createEditor,
  useIsomorphicLayoutEffect,
  Placeholder,
  Editor,
  isTouchDevice,
  Editable,
} from '@editablejs/editor'
import { withPlugins, useContextMenuEffect, ContextMenuStore } from '@editablejs/plugins'
import {
  withYHistory,
  withYjs,
  withCursors,
  YjsEditor,
  CursorData,
  useRemoteStates,
  CursorEditor,
} from '@editablejs/plugin-yjs'
import randomColor from 'randomcolor'
import { faker } from '@faker-js/faker'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { withHTMLSerializer, withTextSerializer } from '@editablejs/plugins/serializer'
import { withHTMLDeserializer } from '@editablejs/plugins/deserializer'
import { withHistory } from '@editablejs/plugin-history'
import {
  ToolbarComponent,
  useToolbarEffect,
  withToolbar,
  Toolbar,
} from '@editablejs/plugin-toolbar'
import {
  withInlineToolbar,
  useInlineToolbarEffect,
  InlineToolbar,
} from '@editablejs/plugin-toolbar/inline'
import {
  withSideToolbar,
  useSideToolbarMenuEffect,
  SideToolbar,
} from '@editablejs/plugin-toolbar/side'
import { Switch, SwitchThumb, Icon, Tooltip } from '@editablejs/ui'
import { createContextMenuItems } from '../configs/context-menu-items'
import {
  createToolbarItems,
  defaultBackgroundColor,
  defaultFontColor,
} from '../configs/toolbar-items'
import { createSideToolbarItems } from '../configs/side-toolbar-items'
import { Seo } from 'components/seo'
import { createGlobalStyle } from 'styled-components'
import { ExternalLink } from 'components/external-link'
import { IconGitHub } from 'components/icon/github'
import Image from 'next/image'
import { IconLogo } from 'components/icon/logo'
import { createInlineToolbarItems } from 'configs/inline-toolbar-items'

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

const StyledToolbar = styled(ToolbarComponent)`
  ${tw`flex justify-start overscroll-contain md:justify-center border border-solid border-t-gray-200 border-b-gray-200 py-2 px-2 md:px-6 overflow-auto`}
`

const StyledContainer = styled.div`
  ${tw`mt-2 md:mt-5 min-h-[80vh] bg-white shadow w-full md:w-[800px] m-auto px-4 py-4 md:px-10 md:py-16 text-sm`}
  line-height: 1.7;
`

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
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      YJS_SERVER: string
    }
  }
}

export default function Playground() {
  const [connected, setConnected] = React.useState(false)
  const [connecting, setConnection] = React.useState(false)
  const [enableCollaborative, setEnableCollaborative] = React.useState(false)
  const document = React.useMemo(() => new Y.Doc(), [])
  const provider = React.useMemo(() => {
    const provider =
      typeof window === 'undefined'
        ? null
        : new WebsocketProvider(process.env.YJS_SERVER, 'editable', document, {
            connect: false,
          })

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
    if (provider) provider.on('status', handleStatus)
    return provider
  }, [document])

  const editor = React.useMemo(() => {
    const { name } = faker
    const cursorData: CursorData = {
      color: randomColor({
        luminosity: 'dark',
        alpha: 1,
        format: 'hex',
      }),
      name: `${name.firstName()} ${name.lastName()}`,
      avatar: faker.image.avatar(),
    }

    const sharedType = document.get('content', Y.XmlText) as Y.XmlText

    let editor = withYjs(createEditor(), sharedType, { autoConnect: false })
    if (provider) {
      editor = withCursors(editor, provider.awareness, {
        data: cursorData,
      })
    }

    editor = withHistory(editor)

    editor = withYHistory(editor)

    editor = withPlugins(editor, {
      fontSize: { defaultSize: '14px' },
      fontColor: { defaultColor: defaultFontColor },
      backgroundColor: { defaultColor: defaultBackgroundColor },
    })
    editor = withInlineToolbar(withToolbar(editor))

    if (!isTouchDevice) {
      editor = withSideToolbar(editor)
    }

    Placeholder.add(editor, {
      check: entry => {
        return Editable.isFocused(editor) && Editor.isBlock(editor, entry[0])
      },
      render: () => {
        return 'Enter some text...'
      },
    })
    return editor
  }, [document, provider])

  // Connect editor and provider in useEffect to comply with concurrent mode
  // requirements.
  React.useEffect(() => {
    if (!provider) return
    if (enableCollaborative) {
      provider.connect()
    }
    return () => {
      provider.disconnect()
    }
  }, [provider, enableCollaborative])

  React.useEffect(() => {
    if (connected) {
      YjsEditor.connect(editor)
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

  useToolbarEffect(() => {
    Toolbar.setItems(editor, createToolbarItems(editor))
  }, editor)

  useInlineToolbarEffect(() => {
    InlineToolbar.setItems(editor, createInlineToolbarItems(editor))
  }, editor)

  useSideToolbarMenuEffect((...a) => {
    SideToolbar.setItems(editor, createSideToolbarItems(editor, ...a))
  }, editor)

  const remoteClients = useRemoteStates<CursorData>(editor as CursorEditor)

  return (
    <>
      <CustomStyles />
      <Seo title="Editable Playground" />
      <EditableProvider editor={editor} initialValue={initialValue}>
        <StyledHeader>
          <div tw="flex justify-between py-3 px-6 text-base">
            <div tw="flex text-2xl text-link flex-1 gap-3">
              <NextLink href="/">
                <a>
                  <IconLogo />
                </a>
              </NextLink>
              <ExternalLink
                aria-label="Editable on Github"
                href="https://github.com/editablejs/editable/blob/main/apps/docs/src/pages/playground.tsx"
              >
                <IconGitHub />
              </ExternalLink>
            </div>
            <div tw="flex gap-1 items-center">
              {Object.keys(remoteClients).map(id => {
                const state = remoteClients[id]
                if (!state.data) return
                const { name, avatar } = state.data
                return (
                  <Tooltip key={id} content={name}>
                    <div tw="rounded-full w-7 h-7 overflow-hidden">
                      <Image alt={name} src={avatar} width={28} height={28} />
                    </div>
                  </Tooltip>
                )
              })}
              <div tw="flex items-center text-xs ml-3">
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
          <StyledToolbar editor={editor} />
        </StyledHeader>
        <StyledContainer>
          <ContentEditable placeholder="Please enter content..." />
        </StyledContainer>
      </EditableProvider>
    </>
  )
}
