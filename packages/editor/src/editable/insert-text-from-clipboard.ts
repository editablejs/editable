import { readClipboardData } from "@/dom-utils";
import { EditableInterface, Transforms } from "@/interfaces";
import { IS_PASTE_TEXT } from "@/utils";

export const insertTextFromClipboard: EditableInterface['insertTextFromClipboard'] = (editor, at) => {
  if (at) {
    Transforms.select(editor, at)
  }
  readClipboardData().then(data => {
    IS_PASTE_TEXT.set(editor, true)
    const event = new ClipboardEvent('pasteText', { clipboardData: data })
    editor.onPaste(event)
  })
}
