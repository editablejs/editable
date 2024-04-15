import { Editor, Range, Transforms } from "@/interfaces"

export const cut = (editor: Editor, range?: Range) => {
  const data = editor.toDataTransfer(range)
  const event = new ClipboardEvent('copy', { clipboardData: data })
  if (range) {
    Transforms.select(editor, range)
  }
  editor.onCut(event)
}
