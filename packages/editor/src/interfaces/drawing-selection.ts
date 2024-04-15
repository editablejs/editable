import { Selection, Editor } from '@/interfaces'

/**
 * Represents the drawing style for a selection.
 */
export interface DrawingSelectionStyle {
  /**
   * The color of the selection when it is in focus.
   */
  focusColor?: string

  /**
   * The color of the selection when it is not in focus.
   */
  blurColor?: string

  /**
   * The color of the caret (cursor).
   */
  caretColor?: string

  /**
   * The width of the caret (cursor).
   */
  caretWidth?: number

  /**
   * The color of the drag cursor.
   */
  dragColor?: string

  /**
   * The color of the touch cursor.
   */
  touchColor?: string

  /**
   * The width of the touch cursor.
   */
  touchWidth?: number
}

export interface DrawingSelection {
  style: DrawingSelectionStyle
  selection: Selection | null
  enabled: boolean
}

export interface DrawingSelectionInterface {
  getDrawingSelection: (editable: Editor) => DrawingSelection
  setDrawingSelection: (editable: Editor, drawingSelection: Partial<DrawingSelection>) => void
}

const EDITOR_TO_DRAWING_SELECTION = new WeakMap<Editor, DrawingSelection>()

const getOrCreateDrawingSelection = (editor: Editor) => {
  let drawingSelection = EDITOR_TO_DRAWING_SELECTION.get(editor)
  if (!drawingSelection) {
    drawingSelection = {
      style: {
        focusColor: 'rgba(0,127,255,0.3)',

        blurColor: 'rgba(136, 136, 136, 0.3)',

        caretColor: '#000',

        caretWidth: 1,

        dragColor: 'rgb(37, 99, 235)',

        touchWidth: 2,

        touchColor: 'rgb(37, 99, 235)',
      },
      selection: null,
      enabled: true,
    }
    EDITOR_TO_DRAWING_SELECTION.set(editor, drawingSelection)
  }
  return drawingSelection
}

export const DrawingSelection: DrawingSelectionInterface = {
  getDrawingSelection: (editor) => {
    return getOrCreateDrawingSelection(editor)
  },
  setDrawingSelection: (ediotr, drawingSelection) => {
    const currentDrawingSelection = getOrCreateDrawingSelection(ediotr)
    const newDrawingSelection = { ...currentDrawingSelection, ...drawingSelection }
    ediotr.onDrawingSelectionChange(newDrawingSelection)
  }
}

