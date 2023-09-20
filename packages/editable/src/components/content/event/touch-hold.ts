import { Editable } from "../../../plugin/editable";

const editorToTouchHoldTimer = new WeakMap<Editable, number | null>();

export const startTouchHoldTimer = (editor: Editable, callback: () => void) => {
  clearTouchHoldTimer(editor);
  const timer = setTimeout(callback, 530);
  editorToTouchHoldTimer.set(editor, timer);
}

export const clearTouchHoldTimer = (editor: Editable) => {
  const timer = editorToTouchHoldTimer.get(editor);
  if (timer) {
    clearTimeout(timer);
  }
}
