import { Editable, Hotkey } from '@editablejs/editor'
import { Editor, Element, Range, Point, Transforms, Text, Path } from '@editablejs/models'
import { ImageEditor } from './image-editor'

const findMatchedRange = (editor: Editor, at: Point) => {
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
  const reg = /!\[(.*)\]\((.*)\)$/
  let match = beforeText.match(reg)
  if (match && match.length > 1) {
    const title = match[1]
    const url = match[2]
    const matchedTexts = Editor.nodes<Text>(editor, {
      at: range,
      match: (n, p) => Text.isText(n) && (n === startText[0] || Path.isBefore(p, startText[1])),
      reverse: true,
    })
    let content = ''
    for (const [text, path] of matchedTexts) {
      if (text === startText[0]) {
        content = text.text.slice(0, at.offset)
      } else {
        content = text.text + content
      }
      match = content.match(reg)
      if (match && match.length > 1) {
        const offset = match.index ?? 0
        return {
          title,
          url,
          range: { anchor: { path, offset }, focus: at },
        }
      }
    }
  }
}
export const withShortcuts = (editor: Editable) => {
  const { onKeydown } = editor

  editor.onKeydown = event => {
    const { selection } = editor
    if (
      selection &&
      Range.isCollapsed(selection) &&
      !Editable.isComposing(editor) &&
      Hotkey.match('space', event)
    ) {
      const anchor = Range.start(selection)
      const match = findMatchedRange(editor, anchor)
      if (match) {
        event.preventDefault()
        const { range, url } = match
        Transforms.delete(editor, {
          at: range,
        })
        Transforms.collapse(editor)
        ImageEditor.insert(editor, {
          file: url,
        })
        return
      }
    }
    onKeydown(event)
  }
}
