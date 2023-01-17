import {
  Editable,
  RenderElementProps,
  Transforms,
  useIsomorphicLayoutEffect,
  useNodeFocused,
} from '@editablejs/editor'
import { FC, useEffect, useRef, useState } from 'react'
import tw from 'twin.macro'

import { indentWithTab } from '@codemirror/commands'
import {
  EditorView,
  lineNumbers,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  keymap,
} from '@codemirror/view'
import { Compartment, EditorSelection, EditorState } from '@codemirror/state'
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap,
} from '@codemirror/language'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { CodeBlock } from '../interfaces/codeblock'
import { CodeBlockEditor } from '../plugin/editor'
import { CodeBlockPopover } from './popover'
import { createRoot } from 'react-dom/client'
import { Icon } from '@editablejs/ui'
import { getOptions } from '../options'
import { getCodeBlockPlugins, IS_YJS, YJS_DEFAULT_VALUE } from '../weak-map'

const basicSetup = (() => [
  lineNumbers(),
  highlightSpecialChars(),
  history(),
  foldGutter({
    markerDOM: open => {
      const marker = document.createElement('span')
      createRoot(marker).render(
        <Icon name="arrowCaretDown" css={[tw`text-xxs align-[0px]`, !open && tw`-rotate-90`]} />,
      )
      return marker
    },
  }),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  rectangularSelection(),
  crosshairCursor(),
  keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
])()

const baseTheme = EditorView.baseTheme({
  '&.cm-editor': {
    background: '#fafafa',
    ...tw`rounded-md`,
  },
  '&.cm-focused': tw`outline-none`,
  '.cm-scroller': tw`font-mono leading-normal text-base py-1`,
  '.cm-gutters': tw`bg-transparent border-none`,
  '.cm-lineNumbers .cm-gutterElement': tw`pl-4 pr-1`,
})

const tabSize = new Compartment()

export interface CodeBlockProps extends RenderElementProps<CodeBlock> {
  editor: CodeBlockEditor
}

export const CodeBlockComponent: FC<CodeBlockProps> = ({
  editor,
  children,
  attributes,
  element,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const focused = useNodeFocused()

  const [plugins, setPlugins] = useState(() => {
    return getOptions(editor).plugins ?? []
  })

  const elementRef = useRef(element)
  const viewRef = useRef<EditorView | null>(null)

  useIsomorphicLayoutEffect(() => {
    elementRef.current = element
  }, [element])

  useIsomorphicLayoutEffect(() => {
    setPlugins(prev => {
      const plugins = getCodeBlockPlugins(editor, elementRef.current)
      return prev.concat(plugins)
    })
  }, [editor])

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return

    const view = new EditorView({
      parent: ref.current,
    })

    viewRef.current = view

    view.focus()

    return () => {
      view.destroy()
    }
  }, [editor])

  useEffect(() => {
    if (!viewRef.current) return

    const extensions = [
      basicSetup,
      baseTheme,
      tabSize.of(EditorState.tabSize.of(2)),
      keymap.of([indentWithTab]),
      EditorView.domEventHandlers({
        focus: () => {
          Transforms.select(editor, Editable.findPath(editor, elementRef.current))
        },
      }),
      EditorView.updateListener.of(update => {
        console.log(
          update.state.selection.main,
          update.view.domAtPos(update.state.selection.main.anchor),
        )
        if (update.docChanged) {
          const code = update.state.doc.toString()
          CodeBlockEditor.updateCodeBlock(editor, elementRef.current, { code })
          // console.log(viewRef.current?.state.selection, viewRef.current?.coordsAtPos)
        }
      }),
      ...plugins,
    ]

    const state = EditorState.create({
      doc: IS_YJS.get(editor) ? YJS_DEFAULT_VALUE.get(editor) : elementRef.current.code,
      extensions,
    })
    viewRef.current.setState(state)
  }, [editor, plugins])

  return (
    <CodeBlockPopover editor={editor} element={element}>
      <div {...attributes}>
        <div tw="hidden absolute">{children}</div>
        <div
          ref={ref}
          css={[tw`rounded-md border border-[#e5e7eb]`, focused && tw`border-primary`]}
        ></div>
      </div>
    </CodeBlockPopover>
  )
}
