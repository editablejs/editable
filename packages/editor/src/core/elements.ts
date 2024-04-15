import { Editor, EditorElements, Element } from "../interfaces";
import { WithEditorFirstArg } from "../utils";

const EDITOR_ACTIVE_ELEMENTS = new WeakMap<Editor, EditorElements>()
export const elements: WithEditorFirstArg<Editor['getElements']> = (editor, at) => {
  let caches = EDITOR_ACTIVE_ELEMENTS.get(editor)
  if (caches && !at) return caches
  const editorElements: EditorElements = {}
  editor.normalizeSelection(selection => {
    if (selection === null) return
    const nodeEntries = Editor.nodes<Element>(editor, {
      at: selection,
      match: n => !Editor.isEditor(n) && Element.isElement(n),
    })

    for (const entry of nodeEntries) {
      const type = entry[0].type ?? 'paragraph'
      if (editorElements[type]) editorElements[type].push(entry)
      else editorElements[type] = [entry]
    }
  }, at)
  if (!at) EDITOR_ACTIVE_ELEMENTS.set(editor, editorElements)
  return editorElements
}

export const clearElements = (editor: Editor) => {
  EDITOR_ACTIVE_ELEMENTS.delete(editor)
}
