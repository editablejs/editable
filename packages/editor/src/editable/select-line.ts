import { EditableInterface, Range, Node, Element, Editor, Transforms } from "@/interfaces";

export const selectLine: EditableInterface['selectLine'] = (editor, at, edge = 'focus') => {
  if (at) {
    Transforms.select(editor, at)
  }
  const { selection } = editor
  if (!selection) return
  const point = ['focus', 'end'].includes(edge) ? Range.end(selection) : Range.start(selection)
  const { path } = point
  const node = Node.get(editor, path)
  let linePath = path
  if (!Element.isElement(node) || !Editor.isBlock(editor, node)) {
    const block = Editor.above(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
      at: path,
    })

    linePath = block?.[1] ?? path.slice(0, 1)
  }

  const range = Editor.range(editor, linePath)
  Transforms.select(editor, range)
  editor.onSelectEnd()
}
