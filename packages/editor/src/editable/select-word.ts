import { EditableInterface, Transforms, Range, Editor } from "@/interfaces";
import { getWordRangeFromOffset } from "@/tokenizer";

export const selectWord: EditableInterface['selectWord'] = (editor, at, edge = 'focus') => {
  if (at) {
    Transforms.select(editor, at)
  }
  const { selection } = editor
  if (!selection) return
  const point = ['focus', 'end'].includes(edge) ? Range.end(selection) : Range.start(selection)
  const { text, offset } = Editor.getBlockTextAndOffsetFromPoint(editor, point)
  if (text) {
    const { path } = point
    const [startOffset, endOffset] = getWordRangeFromOffset(text, offset)
    Transforms.select(editor, {
      anchor: Editor.getSubPointFromBlockTextAndOffset(editor, path, startOffset, true),
      focus: Editor.getSubPointFromBlockTextAndOffset(editor, path, endOffset),
    })
    editor.onSelectEnd()
  }
}
