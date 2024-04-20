import { CompositionText, Editor, Text, Transforms } from "@/interfaces";
import { IS_COMPOSING } from "@/utils";

export const onCompositionEnd = (editor: Editor, value: string) => {
  const { selection } = editor
  if (!selection) return
  const [node, path] = Editor.node(editor, selection)
  if (Text.isText(node)) {
    const composition = CompositionText.isCompositionText(node) ? node.composition : null
    Transforms.setNodes<CompositionText>(
      editor,
      {
        composition: undefined,
      },
      { at: path },
    )
    const point = { path, offset: composition?.offset ?? selection.anchor.offset }
    const range = composition?.isEmpty
      ? {
        anchor: { path, offset: 0 },
        focus: { path, offset: 1 },
      }
      : point
    Transforms.select(editor, range)

    IS_COMPOSING.set(editor, false)
    Transforms.insertText(editor, value)
  }
}
