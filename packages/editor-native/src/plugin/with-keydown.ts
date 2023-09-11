import { Editor, Transforms, Node, Range } from '@editablejs/models'
import getDirection from 'direction'
import Hotkeys from '../utils/hotkeys'
import { getWordOffsetBackward, getWordOffsetForward } from '../utils/text'
import { IS_PASTE_TEXT, IS_SHIFT_PRESSED } from '../utils/weak-maps'
import { Editable } from './editable'

export const withKeydown = <T extends Editor>(editor: T) => {
  const e = editor as T & Editable

  e.onKeydown = (event: KeyboardEvent) => {
    e.emit('keydown', event)
    if (event.defaultPrevented) return
    const { selection } = editor
    const element = editor.children[selection !== null ? selection.focus.path[0] : 0]
    const isRTL = getDirection(Node.string(element)) === 'rtl'

    if (Hotkeys.isShift(event)) {
      IS_SHIFT_PRESSED.set(e, true)
    }

    if (Hotkeys.isSelectAll(event)) {
      event.preventDefault()
      Transforms.select(e, Editor.range(e, []))
      return
    }

    if (Hotkeys.isCut(event)) {
      event.preventDefault()
      e.cut()
      return
    }

    if (Hotkeys.isCopy(event)) {
      event.preventDefault()
      e.copy()
      return
    }

    if (Hotkeys.isPaste(event)) {
      IS_PASTE_TEXT.set(e, false)
      return
    }

    if (Hotkeys.isPasteText(event)) {
      IS_PASTE_TEXT.set(e, true)
      return
    }

    if (Hotkeys.isExtendForward(event)) {
      event.preventDefault()
      Transforms.move(e, { edge: 'focus' })
      return
    }

    if (Hotkeys.isExtendBackward(event)) {
      event.preventDefault()
      Transforms.move(e, { edge: 'focus', reverse: true })
      return
    }

    if (Hotkeys.isExtendUp(event)) {
      event.preventDefault()
      const point = Editable.findPreviousLinePoint(e)
      if (point && selection)
        Transforms.select(editor, {
          anchor: selection.anchor,
          focus: point,
        })
      return
    }

    if (Hotkeys.isExtendDown(event)) {
      event.preventDefault()
      const point = Editable.findNextLinePoint(e)
      if (point && selection)
        Transforms.select(editor, {
          anchor: selection.anchor,
          focus: point,
        })
      return
    }

    if (Hotkeys.isMoveUp(event)) {
      event.preventDefault()
      const point = Editable.findPreviousLinePoint(e)
      if (point) Transforms.select(editor, point)
      return
    }

    if (Hotkeys.isMoveDown(event)) {
      event.preventDefault()
      const point = Editable.findNextLinePoint(e)
      if (point) Transforms.select(editor, point)
      return
    }

    if (Hotkeys.isExtendLineBackward(event)) {
      event.preventDefault()
      Transforms.move(e, {
        unit: 'line',
        edge: 'focus',
        reverse: true,
      })
      return
    }

    if (Hotkeys.isExtendLineForward(event)) {
      event.preventDefault()
      Transforms.move(e, { unit: 'line', edge: 'focus' })
      return
    }

    if (Hotkeys.isMoveWordBackward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Transforms.collapse(editor, { edge: 'focus' })
      }
      if (selection) {
        const { focus } = selection
        const { path: focusPath } = focus
        if (Editor.isStart(editor, focus, focusPath)) {
          Transforms.move(e, { reverse: !isRTL })
          return
        }
        const { text, offset } = Editable.findTextOffsetOnLine(e, focus)
        if (text) {
          const wordOffset = getWordOffsetBackward(text, offset)
          const newPoint = Editable.findPointOnLine(e, focusPath, wordOffset)
          Transforms.select(editor, newPoint)
          return
        }
      }
      Transforms.move(e, { unit: 'word', reverse: !isRTL })
      return
    }

    if (Hotkeys.isMoveWordForward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Transforms.collapse(editor, { edge: 'focus' })
      }
      if (selection) {
        const { focus } = selection
        const { path: focusPath } = focus
        if (Editor.isEnd(editor, focus, focusPath)) {
          Transforms.move(e, { reverse: isRTL })
          return
        }
        const { text, offset } = Editable.findTextOffsetOnLine(e, focus)
        if (text) {
          const wordOffset = getWordOffsetForward(text, offset)
          Transforms.select(editor, Editable.findPointOnLine(e, focusPath, wordOffset))
          return
        }
      }
      Transforms.move(e, { unit: 'word', reverse: isRTL })
      return
    }

    if (Hotkeys.isMoveBackward(event)) {
      event.preventDefault()

      if (selection && Range.isCollapsed(selection)) {
        Transforms.move(e, { reverse: !isRTL })
      } else {
        Transforms.collapse(editor, { edge: 'start' })
      }

      return
    }

    if (Hotkeys.isMoveForward(event)) {
      event.preventDefault()

      if (selection && Range.isCollapsed(selection)) {
        Transforms.move(e, { reverse: isRTL })
      } else {
        Transforms.collapse(editor, { edge: 'end' })
      }

      return
    }

    if (Hotkeys.isMoveLineStart(event)) {
      event.preventDefault()

      const point = Editable.findLineEdgePoint(e)
      if (point) {
        Transforms.select(editor, point)
      }

      return
    }

    if (Hotkeys.isMoveLineEnd(event)) {
      event.preventDefault()

      const point = Editable.findLineEdgePoint(e, { edge: 'end' })
      if (point) {
        Transforms.select(editor, point)
      }

      return
    }

    if (Hotkeys.isMoveEditorStart(event)) {
      event.preventDefault()

      e.focus(true)

      return
    }

    if (Hotkeys.isMoveEditorEnd(event)) {
      event.preventDefault()

      e.focus(false)

      return
    }

    if (Hotkeys.isSoftBreak(event)) {
      event.preventDefault()
      Editor.insertSoftBreak(editor)
      return
    }

    if (Hotkeys.isSplitBlock(event)) {
      event.preventDefault()
      Editor.insertBreak(editor)
      return
    }

    if (Hotkeys.isDeleteBackward(event)) {
      event.preventDefault()
      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor)
      } else {
        Editor.deleteBackward(editor)
      }
      return
    }

    if (Hotkeys.isDeleteForward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor)
      }

      return
    }

    if (Hotkeys.isDeleteLineBackward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'backward' })
      } else {
        Editor.deleteBackward(editor, { unit: 'line' })
      }

      return
    }

    if (Hotkeys.isDeleteLineForward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor, { unit: 'line' })
      }

      return
    }

    if (Hotkeys.isDeleteWordBackward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'backward' })
      } else {
        Editor.deleteBackward(editor, { unit: 'word' })
      }

      return
    }

    if (Hotkeys.isDeleteWordForward(event)) {
      event.preventDefault()

      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor, { direction: 'forward' })
      } else {
        Editor.deleteForward(editor, { unit: 'word' })
      }

      return
    }
  }
}
