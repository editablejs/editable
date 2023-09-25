import { StoreApi, createStore } from '../store'
import { Editor, Range, Element, Path, Selection } from '@editablejs/models'
import { Editable } from './editable'

interface BaseDragOptions {
  /**
    * 拖拽的起始位置
    */
  from: Range | Path;
  /**
   * 拖拽目标位置
   */
  to: Selection | Path;
  /**
   * 拖拽的数据
   */
  data: DataTransfer;
  /**
   * 当前鼠标位置
   */
  position: { x: number; y: number };
}

export interface BlockDragOptions extends BaseDragOptions {
  type: 'block';
}

export interface TextDragOptions extends BaseDragOptions {
  type: 'text';
}

export type DragOptions = BlockDragOptions | TextDragOptions;

export interface DragStore {
  activeDrag: DragOptions | null
}

const EDITOR_TO_DRAG_STORE = new WeakMap<Editor,StoreApi<DragStore>>()

const getOrCreateDragStore = (editor: Editor) => {
  let store = EDITOR_TO_DRAG_STORE.get(editor)
  if (!store) {
    store = createStore<DragStore>(() => ({
      activeDrag: null,
    }))
    EDITOR_TO_DRAG_STORE.set(editor, store)
  }
  return store
}

export const Drag = {
  getStore: getOrCreateDragStore,
  getState: (editor: Editor) => {
    const store = getOrCreateDragStore(editor)
    const { activeDrag } = store.getState()
    return activeDrag
  },

  setState: (editor: Editor, drag: Partial<DragOptions> | null) => {
    const store = getOrCreateDragStore(editor)
    store.setState(state => {
      return {
        activeDrag: drag === null ? null : Object.assign({}, state.activeDrag, drag),
      }
    })
  },

  calculateBlockPath: (editor: Editor, dragOptions: BlockDragOptions) => {
    const { to, position } = dragOptions
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
