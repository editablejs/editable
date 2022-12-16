import { Editor, Node, Text, Element, EditorPointOptions, Point, Location, Path } from 'slate'
import { Editable } from '../plugin/editable'

const { marks: slateMarks, point: slatePoint } = Editor

Editor.marks = (editor: Editor): Omit<Text, 'text' | 'composition'> => {
  let marks: Omit<Text, 'text' | 'composition'> = {}
  let isEqual = true
  if (Editable.isEditor(editor)) {
    editor.normalizeSelection(selection => {
      if (!selection) return
      const editorMarks = slateMarks({ ...editor, selection })
      if (isEqual && editorMarks !== editor.marks) {
        isEqual = false
      }
      marks = Object.assign(marks, editorMarks)
    })
  } else {
    return slateMarks(editor) ?? marks
  }
  return isEqual ? editor.marks ?? {} : marks
}

const startPoint = (root: Node, at: Point): Point => {
  const { path } = at
  const p = path.slice()
  let n = Node.get(root, p)
  let offset = at.offset
  while (n) {
    if (Text.isText(n) || n.children.length === 0) {
      break
    } else {
      const index = Math.min(offset, n.children.length - 1)
      n = n.children[index]
      p.push(index)
      offset = 0
    }
  }
  return {
    path: p,
    offset,
  }
}

const endPoint = (root: Node, at: Point): Point => {
  const { path } = at
  const p = path.slice()
  let n = Node.get(root, p)
  let offset = at.offset
  while (n) {
    if (Text.isText(n) || n.children.length === 0) {
      break
    } else {
      const index = Math.min(offset, n.children.length - 1)
      n = n.children[index]
      p.push(index)
      offset = Element.isElement(n) ? n.children.length : n.text.length
    }
  }
  return {
    path: p,
    offset,
  }
}

Editor.point = (editor: Editor, at: Location, options: EditorPointOptions = {}) => {
  if (Point.isPoint(at)) {
    const { edge = 'start' } = options
    if (edge === 'end') {
      return endPoint(editor, at)
    } else {
      return startPoint(editor, at)
    }
  } else {
    return slatePoint(editor, at, options)
  }
}

export {
  Editor,
  Element,
  Location,
  Node,
  Operation,
  Path,
  PathRef,
  Point,
  PointRef,
  Range,
  RangeRef,
  Scrubber,
  Span,
  Text,
} from 'slate'
