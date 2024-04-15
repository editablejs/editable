import { Editor, Range, Node, Placeholder } from "@/interfaces";

const EDITOR_TO_PREV_SELECTION = new WeakMap<Editor, Range | null>()
const EDITOR_TO_PREV_ANCHOR_NODE = new WeakMap<Editor, Node | null>()
const EDITOR_TO_PREV_FOCUS_NODE = new WeakMap<Editor, Node | null>()

export const onChange = (editor: Editor) => {
  const { selection } = editor
  const prevSelection = EDITOR_TO_PREV_SELECTION.get(editor)
  const prevAnchorNode = EDITOR_TO_PREV_ANCHOR_NODE.get(editor)
  const prevFocusNode = EDITOR_TO_PREV_FOCUS_NODE.get(editor)
  if (
    ((!prevSelection || !selection) && prevSelection !== selection) ||
    (prevSelection &&
      selection &&
      (!Range.equals(prevSelection, selection) ||
        prevAnchorNode !== Node.get(editor, selection.anchor.path) ||
        prevFocusNode !== Node.get(editor, selection.focus.path)))
  ) {
    editor.onSelectionChange()
    EDITOR_TO_PREV_SELECTION.set(editor, selection ? Object.assign({}, selection) : null)
    EDITOR_TO_PREV_ANCHOR_NODE.set(editor, selection ? Node.get(editor, selection.anchor.path) : null)
    EDITOR_TO_PREV_FOCUS_NODE.set(editor, selection ? Node.get(editor, selection.focus.path) : null)
  }
  Placeholder.refresh(editor)
}
