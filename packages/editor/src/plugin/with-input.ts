import { CompositionText, Editor, Transforms, Range, Text } from '@editablejs/models'
import { IS_COMPOSING } from '../utils/weak-maps'
import { Editable } from './editable'

export const withInput = <T extends Editor>(editor: T) => {
  const e = editor as T & Editable

  e.onInput = (value: string) => {
    if (!editor.selection) return
    if (Editable.isComposing(editor)) {
      const { selection, marks } = editor
      let [node, path] = Editor.node(editor, selection)
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
        e.marks = null
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
    e.emit('input', value)
  }

  e.onBeforeInput = value => {
    e.emit('beforeinput', value)
  }

  e.onCompositionStart = data => {
    if (editor.selection && Range.isExpanded(editor.selection)) {
      Editor.deleteFragment(editor)
    }
    IS_COMPOSING.set(editor, true)
    e.emit('compositionstart', data)
  }

  e.onCompositionEnd = (value: string) => {
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
    e.emit('compositionend', value)
  }

  return e
}
