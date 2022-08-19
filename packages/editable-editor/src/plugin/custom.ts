import { Editor, Path, Point, Range, Transforms, createEditor as createSlateEditor, Text } from "slate"
import { SelectionMoveOptions } from "slate/dist/transforms/selection"
import { Editable } from "./editable"
import { withEditable } from "./with-editable"

const { withoutNormalizing, marks: slateMarks} = Editor

Editor.withoutNormalizing = (editor: Editor, fn: () => void) => { 
  if(Editable.isEditor(editor)) {
    editor.normalizeSelection(selection => {
      if(editor.selection !== selection) editor.selection = selection
      withoutNormalizing(editor, fn)
    })
  } else {
    withoutNormalizing(editor, fn)
  }
}

Editor.marks = (editor: Editor): Omit<Text, 'text' | 'composition'> => {
  let marks: Omit<Text, 'text' | 'composition'> = {}
  if(Editable.isEditor(editor)) {
    editor.normalizeSelection(selection => {
      const editorMarks = slateMarks({...editor, selection})
      marks = Object.assign(marks, editorMarks)
    })
  } else {
    return slateMarks(editor) ?? marks
  }
  return marks
}
  
const getVoidPoint = (editor: Editable, point: Point, reverse: boolean) => { 
  const voidElement = Editor.above(editor, {
    at: point,
    match: n => Editor.isVoid(editor, n),
  })
  if(voidElement && !editor.canFocusVoid(voidElement[0])) {
    const path = voidElement[1]
    const p = reverse ? Path.previous(path) : Path.next(path)
    return Editor.point(editor, p, {
      edge: reverse ? 'end' : 'start',
    })
  }
  return point
}

const { move } = Transforms

Transforms.move = (editor: Editor, options: SelectionMoveOptions = {}) => { 
  if(Editable.isEditor(editor)) {
    const { selection } = editor
    const { distance = 1, unit = 'character', reverse = false } = options
    
    let { edge = null } = options

    if (!selection) {
      return
    }

    if (edge === 'start') {
      edge = Range.isBackward(selection) ? 'focus' : 'anchor'
    }

    if (edge === 'end') {
      edge = Range.isBackward(selection) ? 'anchor' : 'focus'
    }

    const { anchor, focus } = selection
    const opts = { distance, unit }
    const props: Partial<Range> = {}

    if (edge == null || edge === 'anchor') {
      const point = reverse
        ? Editor.before(editor, anchor, opts)
        : Editor.after(editor, anchor, opts)

      if (point) {
        props.anchor = point
      }
    }

    if (edge == null || edge === 'focus') {
      const point = reverse
        ? Editor.before(editor, focus, opts)
        : Editor.after(editor, focus, opts)

      if (point) {
        props.focus = point
      }
    }

    if(props.anchor) {
      props.anchor = getVoidPoint(editor, props.anchor, reverse)
    }

    if(props.focus) { 
      props.focus = getVoidPoint(editor, props.focus, reverse)
    }

    Transforms.setSelection(editor, props)
  } else {
    move(editor, options)
  }
}

export const createEditor = () => {
  return withEditable(createSlateEditor())
}

export {
  Editor,
  Transforms
}

export * from 'slate'

export { 
  Element,
  Text,
  Node,
  Range,
  RangeRef,
  Point,
  PointRef,
  Path,
  PathRef,
  Span,
  Location,
  Operation,
  Scrubber
} from 'slate'
