import {
  Editable,
  RenderElementProps,
  Transforms,
  useIsomorphicLayoutEffect,
  useNodeFocused,
} from '@editablejs/editor'
import { FC, useRef } from 'react'
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
import { EditorState } from '@codemirror/state'
import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { CodeBlock } from '../interfaces/codeblock'
import { CodeBlockEditor } from '../plugin/editor'
import { CodeBlockPopover } from './popover'
import { createRoot } from 'react-dom/client'
import { Icon } from '@editablejs/ui'
import { getOptions } from '../options'
import { useIndent } from '../hooks/use-indent'
import { useLineWrapping } from '../hooks/use-line-wrapping'
import { useLanguage } from '../hooks/use-language'
import { useEditorView } from '../hooks/use-editor-view'
import { useTheme } from '../hooks/use-theme'
import { baseTheme } from '../themes/base'

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
  bracketMatching(),
  rectangularSelection(),
  crosshairCursor(),
  keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
])()

export interface CodeBlockProps extends RenderElementProps<CodeBlock> {
  editor: CodeBlockEditor
}

export const CodeBlockComponent: FC<CodeBlockProps> = ({
  editor,
  children,
  attributes,
  element,
}) => {
  const focused = useNodeFocused()

  const elementRef = useRef(element)
  const { view, ref } = useEditorView(
    () => {
      const plugins = getOptions(editor).plugins ?? []

      const extensions = [
        basicSetup,
        baseTheme,
        ...editor.getCodeMirrorExtensions(element.id),
        keymap.of([indentWithTab]),
        EditorView.domEventHandlers({
          focus: () => {
            Transforms.select(editor, Editable.findPath(editor, elementRef.current))
          },
        }),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const code = update.state.doc.toString()
            CodeBlockEditor.updateCodeBlock(editor, elementRef.current, { code })
          }
        }),
        ...plugins,
      ]

      return {
        doc: element.code,
        extensions,
      }
    },
    focused,
    [editor, element.id],
  )

  useIsomorphicLayoutEffect(() => {
    elementRef.current = element
  }, [element])
  useTheme(view, element.theme)
  useLanguage(view, editor, element.language)
  useIndent(view, element.tabSize ?? 2)
  useLineWrapping(view, element.lineWrapping ?? false)

  return (
    <CodeBlockPopover editor={editor} element={element} view={view}>
      <div {...attributes}>
        <div tw="hidden absolute">{children}</div>
        <div
          ref={ref}
          css={[
            tw`rounded-md border border-[#e5e7eb] overflow-hidden`,
            focused && tw`border-primary`,
          ]}
        />
      </div>
    </CodeBlockPopover>
  )
}
