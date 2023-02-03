import { Transforms, Range, Point, Path } from 'slate'
import { SelectionMoveOptions } from 'slate/dist/transforms/selection'
import { Editor } from '../interfaces/editor'

const getVoidPoint = (editor: Editor, point: Point, reverse: boolean) => {
  const voidElement = Editor.above(editor, {
    at: point,
    match: n => Editor.isVoid(editor, n),
  })
  if (voidElement && !editor.isSolidVoid(voidElement[0])) {
    const path = voidElement[1]
    const p = reverse ? Path.previous(path) : Path.next(path)
    return Editor.point(editor, p, {
      edge: reverse ? 'end' : 'start',
    })
  }
  return point
}

export const move = (editor: Editor, options: SelectionMoveOptions = {}) => {
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
    const point = reverse ? Editor.before(editor, anchor, opts) : Editor.after(editor, anchor, opts)

    if (point) {
      props.anchor = point
    }
  }

  if (edge == null || edge === 'focus') {
    const point = reverse ? Editor.before(editor, focus, opts) : Editor.after(editor, focus, opts)

    if (point) {
      props.focus = point
    }
  }

  if (props.anchor) {
    props.anchor = getVoidPoint(editor, props.anchor, reverse)
  }

  if (props.focus) {
    props.focus = getVoidPoint(editor, props.focus, reverse)
  }

  Transforms.setSelection(editor, props)
}
