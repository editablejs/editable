import { DOMElement } from '@/dom-utils'
import { Editor, Path, PathRef, PointRef, RangeRef, Node, Ancestor, Key } from '@/interfaces'
/**
 * Two weak maps that allow us rebuild a path given a node. They are populated
 * at render time such that after a render occurs we can always backtrack.
 */

export const NODE_TO_INDEX: WeakMap<Node, number> = new WeakMap()
export const NODE_TO_PARENT: WeakMap<Node, Ancestor> = new WeakMap()

/**
 * Weak maps that allow us to go between Slate nodes and DOM nodes. These
 * are used to resolve DOM event-related logic into Slate actions.
 */
export const EDITOR_TO_WINDOW: WeakMap<Editor, Window> = new WeakMap()
export const EDITOR_TO_ELEMENT: WeakMap<Editor, HTMLElement> = new WeakMap()
export const EDITOR_TO_INPUT: WeakMap<Editor, HTMLTextAreaElement> = new WeakMap()
export const EDITOR_TO_SHADOW: WeakMap<Editor, ShadowRoot | null> = new WeakMap()
export const ELEMENT_TO_NODE: WeakMap<DOMElement, Node> = new WeakMap()
export const NODE_TO_ELEMENT: WeakMap<Node, DOMElement> = new WeakMap()
export const NODE_TO_KEY: WeakMap<Node, Key> = new WeakMap()
export const EDITOR_TO_KEY_TO_ELEMENT: WeakMap<Editor, WeakMap<Key, DOMElement>> = new WeakMap()
export const EDITOR_TO_SELECTION_RECTS = new WeakMap<Editor, DOMRect[]>()

/**
 * Weak maps for storing editor-related state.
 */
export const IS_CLICKING: WeakMap<Editor, boolean> = new WeakMap()
export const IS_COMPOSING: WeakMap<Editor, boolean> = new WeakMap()
export const IS_ON_COMPOSITION_END: WeakMap<Editor, boolean> = new WeakMap()
export const IS_SHIFT_PRESSED: WeakMap<Editor, boolean> = new WeakMap()
export const IS_MOUSEDOWN: WeakMap<Editor, boolean> = new WeakMap()
export const IS_TOUCHMOVING: WeakMap<Editor, boolean> = new WeakMap()
export const IS_TOUCHING: WeakMap<Editor, boolean> = new WeakMap()
export const IS_TOUCH_HOLD: WeakMap<Editor, boolean> = new WeakMap()
export const IS_FOCUSED: WeakMap<Editor, boolean> = new WeakMap()
/**
 * Weak map for associating the context `onChange` context with the plugin.
 */
export const NODE_TO_RESTORE_DOM = new WeakMap<Node, () => void>()

export const IS_PASTE_TEXT: WeakMap<Editor, boolean> = new WeakMap()

export const DIRTY_PATHS: WeakMap<Editor, Path[]> = new WeakMap()
export const DIRTY_PATH_KEYS: WeakMap<Editor, Set<string>> = new WeakMap()
export const FLUSHING: WeakMap<Editor, boolean> = new WeakMap()
export const NORMALIZING: WeakMap<Editor, boolean> = new WeakMap()
export const PATH_REFS: WeakMap<Editor, Set<PathRef>> = new WeakMap()
export const POINT_REFS: WeakMap<Editor, Set<PointRef>> = new WeakMap()
export const RANGE_REFS: WeakMap<Editor, Set<RangeRef>> = new WeakMap()


export const IS_VOID_ELEMENT: WeakMap<DOMElement, boolean> = new WeakMap()
export const IS_INLINE_ELEMENT: WeakMap<DOMElement, boolean> = new WeakMap()
export const IS_ELEMENT: WeakMap<DOMElement, boolean> = new WeakMap()
export const IS_TEXT_ELEMENT: WeakMap<DOMElement, boolean> = new WeakMap()
export const IS_LEAF_ELEMENT: WeakMap<DOMElement, boolean> = new WeakMap()
export const IS_COMPOSING_ELEMENT: WeakMap<DOMElement, boolean> = new WeakMap()
export const IS_STRING_ELEMENT: WeakMap<DOMElement, boolean> = new WeakMap()
export const ZERO_WIDTH_ELEMENT: WeakMap<DOMElement, 'n' | 'z'> = new WeakMap()
export const ZERO_WIDTH_ELEMENT_LENGTH: WeakMap<DOMElement, number> = new WeakMap()
