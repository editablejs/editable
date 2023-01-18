import { Editable } from '@editablejs/editor'
import { Awareness } from '@editablejs/yjs-protocols/awareness'
import * as Y from 'yjs'

export const YJS_DOC_WEAK_MAP = new WeakMap<Editable, Y.Doc>()
export const YJS_AWARENESS_WEAK_MAP = new WeakMap<Editable, Awareness>()
export const HAS_FOCUS_WEAK_MAP = new WeakMap<Editable, boolean>()
