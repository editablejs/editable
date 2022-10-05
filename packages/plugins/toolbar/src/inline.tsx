import { Editable, useEditableStatic, useIsomorphicLayoutEffect, Range } from '@editablejs/editor'
import {
  DismissableLayer,
  Popper,
  PopperAnchor,
  PopperContent,
  Portal,
  Presence,
} from '@editablejs/plugin-ui'
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
  const isSelectEnded = useRef(false)

  const editor = useEditableStatic() as InlineToolbarEditor

  const [open, setOpen] = useState(false)
  const [side, setSide] = useState<'bottom' | 'top'>('bottom')
  const [items, setItems] = useState(InlineToolbarEditor.getOptions(editor).items ?? [])
  const pointRef = useRef({ x: 0, y: 0 })
  const virtualRef = useRef({
    getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...pointRef.current }),
  })

  const handle = (force = false) => {
    const { selection } = editor
    if (selection && Range.isExpanded(selection)) {
      let x = 0,
        y = 0

      const rects = force
        ? Editable.getSelectionRects(editor, selection, false)
        : Editable.getCurrentSelectionRects(editor, false)
      const isBackward = Range.isBackward(selection)
      if (rects) {
        const rect = isBackward ? rects[0] : rects[rects.length - 1]
        x = isBackward ? rect.x : rect.right
        y = isBackward ? rect.y : rect.bottom
      } else {
        const range = Editable.toDOMRange(editor, selection)
        range.collapse(isBackward)
        const rect = range.getBoundingClientRect()
        x = isBackward ? rect.x : rect.right
        y = isBackward ? rect.y : rect.bottom
      }

      pointRef.current = {
        x,
        y,
      }
      isSelectEnded.current = true
      setSide(isBackward ? 'top' : 'bottom')
      setItems(editor.onInlineToolbar(items))
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  useIsomorphicLayoutEffect(() => {
    containerRef.current = Editable.toDOMNode(editor, editor)
    const root = document.createElement('div')
    rootRef.current = root
    document.body.appendChild(root)

    const { onSelectEnd, onSelectStart, onChange } = editor

    editor.onChange = () => {
      if (isSelectEnded.current) {
        handle(true)
      }
      onChange()
    }

    editor.onSelectStart = () => {
      setOpen(false)
      isSelectEnded.current = false
      onSelectStart()
    }

    editor.onSelectEnd = () => {
      handle()
      onSelectEnd()
    }

    return () => {
      document.body.removeChild(root)
      editor.onChange = onChange
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
              sideOffset={5}
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
