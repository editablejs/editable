import { Editor, Point } from "@editablejs/models";

export const EDITOR_TO_CONTEXT_MENU = new WeakMap<Editor, boolean>()


export const EDITOR_TO_START_POINT = new WeakMap<Editor, Point | null>()


export const EDITOR_TO_DOUBLE_CLICK = new WeakMap<Editor, boolean>()


export const EDITOR_TO_DOUBLE_CLICK_WITHIN_THRESHOLD_FUNCTION = new WeakMap<Editor, (event: MouseEvent | TouchEvent | Touch) => boolean>()

export const EDITOR_TO_DRAG_END = new WeakMap<Editor, boolean>()
