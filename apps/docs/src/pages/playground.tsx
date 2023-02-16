import * as React from 'react'
import NextLink from 'next/link'
import { Seo } from 'components/seo'
import { createGlobalStyle } from 'styled-components'
import { ExternalLink } from 'components/external-link'
import { IconGitHub } from 'components/icon/github'
import Image from 'next/image'
import { IconLogo } from 'components/icon/logo'
import tw, { css, styled } from 'twin.macro'
import {
  EditableProvider,
  ContentEditable,
  useIsomorphicLayoutEffect,
  Placeholder,
  isTouchDevice,
  Editable,
  withEditable,
  parseDataTransfer,
} from '@editablejs/editor'
import { Editor, createEditor, Range, Transforms } from '@editablejs/models'
import { MarkdownDeserializer } from '@editablejs/deserializer/markdown'
import {
  withPlugins,
  useContextMenuEffect,
  ContextMenuStore,
  MentionUser,
} from '@editablejs/plugins'
import {
  withYHistory,
  withYjs,
  YjsEditor,
  withYCursors,
  CursorData,
  useRemoteStates,
} from '@editablejs/plugin-yjs'

import randomColor from 'randomcolor'
import { faker } from '@faker-js/faker'
import { WebsocketProvider } from '@editablejs/yjs-websocket'
import * as Y from 'yjs'
import { withHTMLSerializerTransform } from '@editablejs/plugins/serializer/html'
import { withTextSerializerTransform } from '@editablejs/plugins/serializer/text'
import {
  withMarkdownSerializerTransform,
  withMarkdownSerializerPlugin,
} from '@editablejs/plugins/serializer/markdown'
import { withHTMLDeserializerTransform } from '@editablejs/plugins/deserializer/html'
import {
  withMarkdownDeserializerTransform,
  withMarkdownDeserializerPlugin,
} from '@editablejs/plugins/deserializer/markdown'
import { withHistory } from '@editablejs/plugin-history'
import { javascript as codemirrorJavascript } from '@codemirror/lang-javascript-next'
import { html as codemirrorHtml } from '@codemirror/lang-html-next'
import { css as codemirrorCss } from '@codemirror/lang-css-next'
import { withYCodeBlock } from '@editablejs/plugin-codeblock/yjs'
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
import {
  withSlashToolbar,
  useSlashToolbarEffect,
  SlashToolbar,
} from '@editablejs/plugin-toolbar/slash'
import { Switch, SwitchThumb, Icon, Tooltip } from '@editablejs/ui'
import { createContextMenuItems } from '../configs/context-menu-items'
import {
  createToolbarItems,
  defaultBackgroundColor,
  defaultFontColor,
} from '../configs/toolbar-items'
import { createSideToolbarItems } from '../configs/side-toolbar-items'
import { createInlineToolbarItems } from 'configs/inline-toolbar-items'
import { checkMarkdownSyntax } from 'configs/check-markdown-syntax'
import { createSlashToolbarItems } from 'configs/slash-toolbar-items'
import { initialValue } from 'configs/initial-value'

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
  const [readOnly, setReadOnly] = React.useState(false)
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

    let editor = withYjs(withEditable(createEditor()), sharedType, { autoConnect: false })
    if (provider) {
      editor = withYCursors(editor, provider.awareness, {
        data: cursorData,
      })
    }

    editor = withHistory(editor)

    editor = withYHistory(editor)

    editor = withPlugins(editor, {
      fontSize: { defaultSize: '14px' },
      fontColor: { defaultColor: defaultFontColor },
      backgroundColor: { defaultColor: defaultBackgroundColor },
      mention: {
        onSearch: value => {
          return new Promise<MentionUser[]>(resolve => {
            const users: MentionUser[] = []
            for (let i = 0; i < 20; i++) {
              users.push({
                id: i,
                name: faker.name.fullName(),
                avatar: faker.image.avatar(),
              })
            }
            resolve(users)
          })
        },
      },
      codeBlock: {
        languages: [
          {
            value: 'plain',
            content: 'Plain text',
          },
          {
            value: 'javascript',
            content: 'JavaScript',
            plugin: codemirrorJavascript(),
          },
          {
            value: 'html',
            content: 'HTML',
            plugin: codemirrorHtml(),
          },
          {
            value: 'css',
            content: 'CSS',
            plugin: codemirrorCss(),
          },
        ],
      },
    })
    if (provider) editor = withYCodeBlock(editor, document, provider.awareness)
    editor = withInlineToolbar(withToolbar(editor))

    if (!isTouchDevice) {
      editor = withSideToolbar(editor)
    }

    editor = withSlashToolbar(editor)

    Placeholder.add(editor, {
      check: entry => Editable.isFocused(editor) && Editor.isBlock(editor, entry[0]),
      render: () => 'Type / evoke more',
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
    window.__setPreferredTheme('light')
    if (connected) {
      YjsEditor.connect(editor)
    }
    return () => YjsEditor.disconnect(editor)
  }, [editor, connected])

  useIsomorphicLayoutEffect(() => {
    withMarkdownDeserializerPlugin(editor) // Adds a markdown deserializer plugin to the editor
    withMarkdownSerializerPlugin(editor) // Adds a markdown serializer plugin to the editor
    withTextSerializerTransform(editor) // Adds a text serializer transform to the editor
    withHTMLSerializerTransform(editor) // Adds an HTML serializer transform to the editor
    withMarkdownSerializerTransform(editor) // Adds a markdown serializer transform to the editor
    withHTMLDeserializerTransform(editor) // Adds an HTML deserializer transform to the editor
    withMarkdownDeserializerTransform(editor) // Adds a markdown deserializer transform to the editor

    const { onPaste } = editor

    editor.onPaste = event => {
      const { clipboardData, type } = event
      if (!clipboardData || !editor.selection) return onPaste(event)
      const { text, fragment, html, files } = parseDataTransfer(clipboardData)
      const isPasteText = type === 'pasteText'
      if (!isPasteText && (fragment.length > 0 || files.length > 0)) {
        return onPaste(event)
      }
      if (Range.isExpanded(editor.selection)) {
        Transforms.delete(editor)
      }
      const anchor = Range.start(editor.selection)
      onPaste(event)
      // check markdown syntax
      if (checkMarkdownSyntax(text, html) && editor.selection) {
        const focus = Range.end(editor.selection)
        Promise.resolve().then(() => {
          const madst = MarkdownDeserializer.toMdastWithEditor(editor, text)
          const content = MarkdownDeserializer.transformWithEditor(editor, madst)
          editor.selection = {
            anchor,
            focus,
          }
          editor.insertFragment(content)
        })
      }
    }

    return () => {
      editor.onPaste = onPaste
    }
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

  useSlashToolbarEffect(value => {
    SlashToolbar.setItems(editor, createSlashToolbarItems(editor, value))
  }, editor)

  const remoteClients = useRemoteStates<CursorData>(editor)

  return (
    <>
      <CustomStyles />
      <Seo title="Editable Playground" />
      <EditableProvider editor={editor} value={initialValue}>
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
                      <Image alt={name} src={avatar ?? name} width={28} height={28} />
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
                    onChange={setEnableCollaborative}
                    id="collaboration-mode"
                  >
                    <StyledSwitchThumb />
                  </StyledSwitch>
                )}
              </div>
            </div>
          </div>
          <StyledToolbar editor={editor} disabled={readOnly} />
        </StyledHeader>
        <StyledContainer>
          <ContentEditable
            readOnly={readOnly}
            placeholder="Type something. Style with keyboard shortcuts or markdown."
          />
        </StyledContainer>
      </EditableProvider>
    </>
  )
}
