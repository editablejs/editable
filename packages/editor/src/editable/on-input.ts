import { CompositionText, Editor, Transforms, Text, Range } from "@/interfaces";

export const onInput = (editor: Editor, value: string) => {
  if (!editor.selection) return
  if (Editor.isComposing(editor)) {
    const { selection } = editor
    let [node, path] = Editor.node(editor, selection)
    const marks = editor.getMarks()
    if (marks) {
      // 使用零宽字符绕过slate里面不能插入空字符的问题。组合输入法完成后会删除掉
      const compositionText: CompositionText = {
        text: '\u200b',
        ...marks,
        composition: {
          text: value,
          offset: 0,
          isEmpty: true,
        },
      }
      Transforms.insertNodes(editor, compositionText)
    } else if (Text.isText(node)) {
      const composition = CompositionText.isCompositionText(node) ? node.composition : null
      const offset = composition?.offset ?? Range.start(selection).offset

      Transforms.setNodes<CompositionText>(
        editor,
        {
          composition: {
            ...composition,
            text: value,
            offset,
          },
        },
        { at: path },
      )
      const point = { path, offset: offset + value.length }
      Transforms.select(editor, {
        anchor: point,
        focus: point,
      })
    }
  } else {
    editor.insertText(value)
  }
}
