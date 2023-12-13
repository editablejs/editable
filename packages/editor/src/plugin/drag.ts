import { create, StoreApi, UseBoundStore } from 'rezon-store'
import { Editor, Range, Element, Path, Selection } from '@editablejs/models'
import { Editable } from './editable'

export interface DragStore {
  drag: {
    type: 'block' | 'text'
    /**
     * 拖拽的开始位置
     */
    from: Range | Path
    /**
     * 拖拽到目标位置
     */
    to: Selection | Path
    /**
     * 拖拽的数据
     */
    data: DataTransfer
    /**
     * 当前鼠标位置
     */
    position: Record<'x' | 'y', number>
  } | null
}

const EDITOR_TO_DRAG_STORE = new WeakMap<Editor, UseBoundStore<StoreApi<DragStore>>>()

const getDragStore = (editor: Editor) => {
  let store = EDITOR_TO_DRAG_STORE.get(editor)
  if (!store) {
    store = create<DragStore>(() => ({
      drag: null,
    }))
    EDITOR_TO_DRAG_STORE.set(editor, store)
  }
  return store
}

export type SetDragOptions =
  | (Partial<Omit<NonNullable<DragStore['drag']>, 'data'>> & { data?: DataTransfer | null })
  | null
/**
 * 拖拽相关状态操作
 */
export const Drag = {
  getStore: getDragStore,

  getDrag: (editor: Editor) => {
    const store = getDragStore(editor)
    const { drag } = store.getState()
    return drag
  },

  setDrag: (editor: Editor, drag: SetDragOptions) => {
    const store = getDragStore(editor)
    store.setState(state => {
      return {
        drag: drag == null ? null : Object.assign({}, state.drag, drag),
      }
    })
  },

  clear: (editor: Editor) => {
    const store = getDragStore(editor)
    store.setState({ drag: null })
  },

  toBlockPath: (editor: Editor) => {
    const drag = Drag.getDrag(editor)
    if (!drag || drag.type !== 'block') return
    const { to, position } = drag
    if (!to) return
    const entry = Editor.above(editor, {
      at: Path.isPath(to) ? to : to.focus,
      match: n => Element.isElement(n),
      mode: 'lowest',
    })
    if (!entry) return
    const element = Editable.toDOMNode(editor, entry[0])
    const rect = element.getBoundingClientRect()
    const { y, height } = rect
    const { y: pY } = position
    if (pY > y + height / 2) {
      return Path.next(entry[1])
    } else {
      return entry[1]
    }
  },
}
