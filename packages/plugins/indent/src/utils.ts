import { Editor, NodeEntry, Transforms } from '@editablejs/models'
import { Indent } from './interfaces/indent'

export const setTextIndent = (editor: Editor, blockEntry: NodeEntry<Indent>, size: number) => {
  const [block, path] = blockEntry
  const textIndent = block.textIndent ?? 0
  const lineIndent = block.lineIndent ?? 0
  const indent = Math.max(textIndent + size, 0)
  if (size < 0 && textIndent === 0 && lineIndent > 0) {
    setLineIndent(editor, [block, path], size)
    return
  }
  Transforms.setNodes<Indent>(editor, { textIndent: indent }, { at: path })
}

export const setLineIndent = (editor: Editor, blockEntry: NodeEntry<Indent>, size: number) => {
  const [block, path] = blockEntry
  const lineIndent = block.lineIndent ?? 0
  const textIndent = block.textIndent ?? 0
  if (size < 0 && lineIndent === 0 && textIndent > 0) {
    setTextIndent(editor, [block, path], size)
    return
  }
  const indent = Math.max(lineIndent + size, 0)
  Transforms.setNodes(editor, { lineIndent: indent } as Indent, { at: path })
}
