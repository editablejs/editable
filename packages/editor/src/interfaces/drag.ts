import { Range, Path, Selection, Editor, Element } from '..'

interface DragOptionsBase {
  /**
   * 拖拽的起始位置
   */
  source: Range | Path;
  /**
   * 拖拽的目标位置
   */
  destination?: Selection | Path;
  /**
   * 拖拽传输的数据
   */
  dataTransfer: DataTransfer;
  /**
   * 当前鼠标位置
   */
  mousePosition?: { x: number; y: number };
}

export interface BlockDrag extends DragOptionsBase {
  type: 'block';
}

export interface TextDrag extends DragOptionsBase {
  type: 'text';
}

export type Drag = BlockDrag | TextDrag;

const EDITOR_TO_CURRENT_DRAG = new WeakMap<Editor, { current: Drag | null }>()

const getOrCreateCurrentDrag = (editor: Editor) => {
  let drag = EDITOR_TO_CURRENT_DRAG.get(editor)
  if (!drag) {
    drag = {
      current: null,
    }
    EDITOR_TO_CURRENT_DRAG.set(editor, drag)
  }
  return drag
}

export interface DragInterface {
  getCurrentDrag: (editor: Editor) => Drag | null;
  setCurrentDrag: (editor: Editor, drag: (Omit<Drag, 'type'> & { type?: 'block' | 'text' }) | null) => void;
  isBlockDrag: (drag: Drag | null) => drag is BlockDrag;
  isTextDrag: (drag: Drag | null) => drag is TextDrag;
}

export const Drag: DragInterface = {
  getCurrentDrag: (editor: Editor) => {
    const { current } = getOrCreateCurrentDrag(editor)
    return current
  },

  setCurrentDrag: (editor, drag) => {
    const currentDrag = getOrCreateCurrentDrag(editor)
    currentDrag.current = drag ? { type: 'text', ...currentDrag.current, ...drag } : null
    editor.onDragChange(currentDrag.current)
  },

  isBlockDrag: (drag: Drag | null): drag is BlockDrag => {
    return drag?.type === 'block'
  },

  isTextDrag: (drag: Drag | null): drag is TextDrag => {
    return drag?.type === 'text'
  }
}
