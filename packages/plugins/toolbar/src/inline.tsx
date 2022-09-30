import { Editable, useEditableStatic, useIsomorphicLayoutEffect, Range } from '@editablejs/editor'
import { Popper, PopperAnchor, PopperContent, Portal, Presence } from '@editablejs/plugin-ui'
import { useRef, useState } from 'react'
import { Toolbar, ToolbarItem } from './toolbar'

export interface InlineToolbarOptions {
  items?: ToolbarItem[]
}

export const INLINE_TOOLBAR_OPTIONS = new WeakMap<Editable, InlineToolbarOptions>()

interface InlineToolbarEditor extends Editable {
  onInlineToolbar: (items: ToolbarItem[]) => ToolbarItem[]
}

const InlineToolbarEditor = {
  isInlineToolbarEditor: (editor: Editable): editor is InlineToolbarEditor => {
    return !!(editor as InlineToolbarEditor).onInlineToolbar
  },

  getOptions: (editor: Editable): InlineToolbarOptions => {
    return INLINE_TOOLBAR_OPTIONS.get(editor) ?? {}
  },
}

const InlineToolbar = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  const editor = useEditableStatic() as InlineToolbarEditor

  const [open, setOpen] = useState(false)
  const [side, setSide] = useState<'bottom' | 'top'>('bottom')
  const [items, setItems] = useState(InlineToolbarEditor.getOptions(editor).items ?? [])
  const pointRef = useRef({ x: 0, y: 0 })
  const virtualRef = useRef({
    getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...pointRef.current }),
  })

  useIsomorphicLayoutEffect(() => {
    containerRef.current = Editable.toDOMNode(editor, editor)
    const root = document.createElement('div')
    rootRef.current = root
    document.body.appendChild(root)

    const { onSelectEnd, onSelectStart } = editor

    editor.onSelectStart = () => {
      setOpen(false)
      onSelectStart()
    }

    editor.onSelectEnd = () => {
      const { selection } = editor
      if (selection && Range.isExpanded(selection)) {
        const range = Editable.toDOMRange(editor, selection)
        const isBackward = Range.isBackward(selection)
        range.collapse(isBackward)
        const { x, y, height } = range.getBoundingClientRect()
        pointRef.current = {
          x,
          y: isBackward ? y : y + height,
        }
        setSide(isBackward ? 'top' : 'bottom')
        setItems(editor.onInlineToolbar(items))
        setOpen(true)
      } else {
        setOpen(false)
      }
      onSelectEnd()
    }

    return () => {
      document.body.removeChild(root)
      editor.onSelectStart = onSelectStart
      editor.onSelectEnd = onSelectEnd
    }
  }, [editor])

  if (items.length > 0 && containerRef.current && rootRef.current)
    return (
      <Popper>
        <PopperAnchor virtualRef={virtualRef} />
        <Presence present={open}>
          <Portal container={rootRef.current}>
            <PopperContent
              side={side}
              sideOffset={10}
              tw="bg-white shadow-outer z-50 px-2 py-1 rounded border-gray-300 border-solid border"
            >
              <Toolbar items={items} />
            </PopperContent>
          </Portal>
        </Presence>
      </Popper>
    )
  return null
}

export const withInlineToolbar = <T extends Editable>(
  editor: T,
  options: InlineToolbarOptions = {},
) => {
  const newEditor = editor as T & InlineToolbarEditor

  INLINE_TOOLBAR_OPTIONS.set(newEditor, options)

  const { onRenderContextComponents } = newEditor

  newEditor.onRenderContextComponents = components => {
    components.push(InlineToolbar)
    return onRenderContextComponents(components)
  }

  newEditor.onInlineToolbar = items => items

  return newEditor
}
