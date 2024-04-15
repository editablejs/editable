import { readClipboardData } from "@/dom-utils";
import { EditableInterface, Transforms } from "@/interfaces";

export const insertFromClipboard: EditableInterface['insertFromClipboard'] = (editor, at) => {
  if (at) {
    Transforms.select(editor, at)
  }
  readClipboardData().then(data => {
    const event = new ClipboardEvent('paste', { clipboardData: data })
    editor.onPaste(event)
  })
}
