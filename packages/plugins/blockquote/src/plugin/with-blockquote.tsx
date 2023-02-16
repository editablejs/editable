import { Editable, Hotkey } from '@editablejs/editor'
import { Transforms, Editor, Path, Range, Node, Text } from '@editablejs/models'
import { BLOCKQUOTE_KEY } from '../constants'
import { BlockquoteHotkey, BlockquoteOptions, setOptions } from '../options'
import { BlockquoteEditor } from './blockquote-editor'
import { withShortcuts } from './with-shortcuts'

const defaultHotkey: BlockquoteHotkey = 'mod+shift+u'

const defaultShortcuts: string[] = ['>']

export const withBlockquote = <T extends Editable>(editor: T, options: BlockquoteOptions = {}) => {
  const newEditor = editor as T & BlockquoteEditor

  setOptions(newEditor, options)

  newEditor.toggleBlockquote = () => {
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      if (BlockquoteEditor.isActive(editor)) {
        Transforms.unwrapNodes(editor, {
          match: n => Editor.isBlock(editor, n) && n.type === BLOCKQUOTE_KEY,
          split: true,
        })
      } else {
        Transforms.wrapNodes(
          editor,
          { type: BLOCKQUOTE_KEY, children: [] },
          {
            mode: 'highest',
            match: n =>
              Editor.isBlock(editor, n) &&
              !editor.isGrid(n) &&
              !editor.isGridRow(n) &&
              !editor.isGridCell(n),
          },
        )
      }
    })
  }

  const { renderElement, normalizeNode } = newEditor

  newEditor.normalizeNode = entry => {
    const [node, path] = entry
    if (BlockquoteEditor.isBlockquote(newEditor, node)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (!Editor.isBlock(editor, child)) {
          Transforms.wrapNodes(editor, { type: 'paragraph', children: [] }, { at: childPath })
          return
        }
      }
    }
    return normalizeNode(entry)
  }

  newEditor.renderElement = ({ element, attributes, children }) => {
    if (BlockquoteEditor.isBlockquote(newEditor, element)) {
      return (
        <blockquote
          tw="m-0 pl-4 opacity-50 border-4 border-solid border-gray-200 border-y-0 border-r-0"
          {...attributes}
        >
          {children}
        </blockquote>
      )
    }
    return renderElement({ attributes, children, element })
  }

  const hotkey = options.hotkey ?? defaultHotkey
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const value = Hotkey.match(hotkey, e)
    if (value) {
      e.preventDefault()
      newEditor.toggleBlockquote()
      return
    }

    const { selection } = editor
    if (
      !selection ||
      !Range.isCollapsed(selection) ||
      !BlockquoteEditor.isActive(newEditor) ||
      Hotkey.match('shift+enter', e)
    )
      return onKeydown(e)
    if (Hotkey.match('enter', e)) {
      const entry = Editor.above(newEditor, {
        match: n => Editor.isBlock(newEditor, n) && !Editor.isVoid(newEditor, n),
      })
      if (entry) {
        const [block, path] = entry
        const [parent, parentPath] = Editor.parent(newEditor, path)
        if (Editor.isEmpty(newEditor, block) && BlockquoteEditor.isBlockquote(editor, parent)) {
          e.preventDefault()
          if (parent.children.length === 1) {
            Transforms.unwrapNodes(newEditor, {
              at: parentPath,
            })
          } else {
            Transforms.moveNodes(newEditor, {
              at: path,
              to: Path.next(parentPath),
            })
          }

          return
        }
      }
    }
    onKeydown(e)
  }

  const { shortcuts } = options
  if (shortcuts !== false) {
    withShortcuts(newEditor, defaultShortcuts.concat(Array.isArray(shortcuts) ? shortcuts : []))
  }

  return newEditor
}
