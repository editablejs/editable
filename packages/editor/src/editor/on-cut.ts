import { writeClipboardData } from "@/dom-utils"
import { Editor, Range, Node, Transforms } from "@/interfaces"

export const onCut = (editor: Editor, event: ClipboardEvent) => {
  if (event.defaultPrevented) return
  const { clipboardData } = event
  if (clipboardData) writeClipboardData(clipboardData)
  const { selection } = editor
  if (selection) {
    if (Range.isExpanded(selection)) {
      Editor.deleteFragment(editor)
    } else {
      const node = Node.parent(editor, selection.anchor.path)
      if (Editor.isVoid(editor, node)) {
        Transforms.delete(editor)
      }
    }
  }
}
