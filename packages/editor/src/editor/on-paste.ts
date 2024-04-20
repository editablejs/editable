import { parseFromDataTransfer } from "@/dom-utils"
import { Editor, HTMLDeserializer, Transforms } from "@/interfaces"
import { TEXT_HTML } from "@/utils/constants"

export const onPaste = (editor: Editor, event: ClipboardEvent) => {
  if (event.defaultPrevented) return
  const { clipboardData } = event
  if (!clipboardData) return
  event.preventDefault()
  const { text, fragment, html, files } = parseFromDataTransfer(clipboardData)
  const isPasteText = event.type === 'pasteText'
  if (!isPasteText && fragment.length > 0) {
    editor.insertFragment(fragment)
  } else if (!isPasteText && html) {
    const document = new DOMParser().parseFromString(html, TEXT_HTML)
    const fragment = HTMLDeserializer.apply(editor, document.body)
    editor.insertFragment(fragment)
  } else {
    const lines = text.split(/\r\n|\r|\n/)
    let split = false

    for (const line of lines) {
      if (split) {
        Transforms.splitNodes(editor, { always: true })
      }
      editor.normalizeSelection(selection => {
        if (selection !== editor.selection) editor.selection = selection
        editor.insertText(line)
      })
      split = true
    }
  }
  for (const file of files) {
    editor.insertFile(file)
  }
}
