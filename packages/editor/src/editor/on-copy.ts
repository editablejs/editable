import { writeClipboardData } from "@/dom-utils"
import { Editor } from "@/interfaces"

export const onCopy = (editor: Editor, event: ClipboardEvent) => {
  if (event.defaultPrevented) return
  const { clipboardData } = event
  if (clipboardData) writeClipboardData(clipboardData)
}
