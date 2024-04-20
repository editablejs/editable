import { Editor, Range } from "@/interfaces";

export const copy = (editor: Editor, range?: Range) => {
  const data = editor.toDataTransfer(range)
  const event = new ClipboardEvent('copy', { clipboardData: data })
  editor.onCopy(event)
}
