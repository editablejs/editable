import { Editable, Hotkey } from '@editablejs/editor'
import { Editor, Element, Text, Range, Path, Point, Transforms } from '@editablejs/models'
import { MarkFormat } from '../interfaces/mark'

const findMatchedRange = (editor: Editor, at: Point, shortcuts: Record<string, MarkFormat>) => {
  const [startText] = Editor.nodes<Text>(editor, {
    at,
    match: n => Text.isText(n),
  })
  if (!startText) return

  const block = Editor.above(editor, {
    at,
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  })
  const path = block ? block[1] : []
  const start = Editor.start(editor, path)
  const range = { anchor: at, focus: start }
  const beforeText = Editor.string(editor, range)

  const matchedTexts = Editor.nodes<Text>(editor, {
    at: range,
    match: (n, p) => Text.isText(n) && (n === startText[0] || Path.isBefore(p, startText[1])),
    reverse: true,
  })
  for (const key in shortcuts) {
    if (beforeText.endsWith(key)) {
      const kLen: number = key.length
      // match before shortcut
      const index = beforeText.slice(0, -kLen).lastIndexOf(key)
      if (index === -1) {
        return
      }
      for (const [text, path] of matchedTexts) {
        let offset = -1
        if (text === startText[0]) {
          offset = text.text.slice(0, at.offset - kLen).lastIndexOf(key)
        } else {
          offset = text.text.lastIndexOf(key)
        }
        if (offset > -1) {
          const start = { path, offset: offset + kLen }
          const end = { path: at.path, offset: at.offset - kLen }
          if (Range.isCollapsed({ anchor: start, focus: end })) return
          return {
            shortcut: shortcuts[key],
            range: { anchor: { path, offset }, focus: at },
            start,
            end,
          }
        }
      }
    }
  }
}

export const withShortcuts = (editor: Editable, shortcuts: Record<string, MarkFormat>) => {
  const { onKeydown } = editor

  editor.onKeydown = event => {
    const { selection } = editor
    if (
      selection &&
      Range.isCollapsed(selection) &&
      !Editable.isComposing(editor) &&
      Hotkey.match('space', event)
    ) {
      const { anchor } = selection
      const match = findMatchedRange(editor, anchor, shortcuts)
      if (match) {
        event.preventDefault()
        const { shortcut, range, start, end } = match
        const ref = Editor.rangeRef(editor, range)
        Transforms.delete(editor, {
          at: {
            anchor: end,
            focus: range.focus,
          },
        })
        Transforms.delete(editor, {
          at: {
            anchor: range.anchor,
            focus: start,
          },
        })
        editor.selection = ref.unref()
        editor.addMark(shortcut, true)
        Transforms.collapse(editor, { edge: 'end' })
        return
      }
    }
    onKeydown(event)
  }
}
