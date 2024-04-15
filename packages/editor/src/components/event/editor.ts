import { Editor } from "@/interfaces";

const EDITOR_TO_EVENTS = new WeakMap<Editor, Function[]>()

const getOrCreateEvents = (editor: Editor) => {
  let events = EDITOR_TO_EVENTS.get(editor)
  if (!events) {
    events = []
    EDITOR_TO_EVENTS.set(editor, events)
  }
  return events
}

export const attachEvent = (editor: Editor, ...events: Function[]) => {
  const es = getOrCreateEvents(editor)
  es.push(...events)
}

export const detachEvents = (editor: Editor) => {
  const events = getOrCreateEvents(editor)
  events.forEach(event => event())
  events.length = 0
}
