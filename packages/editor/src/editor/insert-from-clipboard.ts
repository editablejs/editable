import { readClipboardData } from "@/dom-utils";
import { EditorInterface, Transforms } from "@/interfaces";

export const insertFromClipboard: EditorInterface['insertFromClipboard'] = (editor, at) => {
  if (at) {
    Transforms.select(editor, at)
  }
  readClipboardData().then(data => {
    const event = new ClipboardEvent('paste', { clipboardData: data })
    editor.onPaste(event)
  })
}
