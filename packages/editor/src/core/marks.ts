import { Editor, EditorMarks } from '../interfaces/editor'
import { NodeEntry } from '../interfaces/node'
import { Range } from '../interfaces/range'
import { Path } from '../interfaces/path'
import { Text } from '../interfaces/text'
import { Element } from '../interfaces/element'
import { WithEditorFirstArg } from '../utils'

const EDITOR_ACTIVE_MARKS = new WeakMap<Editor, EditorMarks>()


const _marks = (editor: Editor): EditorMarks | null => {
  const { selection } = editor
  if (!selection) return null
  if (Range.isExpanded(selection)) {
    const [match] = Editor.nodes(editor, { match: Text.isText })

    if (match) {
      const [node] = match as NodeEntry<Text>
      const { text, ...rest } = node
      return rest
    } else {
      return {}
    }
  }

  const { anchor } = selection
  const { path } = anchor
  let [node] = Editor.leaf(editor, path)

  if (anchor.offset === 0) {
    const prev = Editor.previous(editor, { at: path, match: Text.isText })
    const markedVoid = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isVoid(editor, n) && editor.markableVoid(n),
    })
    if (!markedVoid) {
      const block = Editor.above(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      })

      if (prev && block) {
        const [prevNode, prevPath] = prev
        const [, blockPath] = block

        if (Path.isAncestor(blockPath, prevPath)) {
          node = prevNode as Text
        }
      }
    }
  }

  const { text, ...rest } = node
  return rest
}

export const marks: WithEditorFirstArg<Editor['getMarks']> = (editor, at) => {
  const caches = EDITOR_ACTIVE_MARKS.get(editor)
  if (caches && !at) return caches
  let editorMarks: EditorMarks = {}
  editor.normalizeSelection(selection => {
    if (editor.selection !== selection) editor.selection = selection
    Object.assign(editorMarks, _marks(editor) ?? {})
  }, at)
  if (!at) EDITOR_ACTIVE_MARKS.set(editor, editorMarks)
  return editorMarks
}

export const clearMarks = (editor: Editor) => {
  EDITOR_ACTIVE_MARKS.delete(editor)
}
