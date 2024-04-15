import { Editor, Node, Transforms, Hotkey, Range } from "@/interfaces";
import { IS_PASTE_TEXT, IS_SHIFT_PRESSED } from "@/utils";
import { getWordOffsetBackwardFromOffset, getWordOffsetForwardFromOffset } from "@/tokenizer";
import { direction } from "direction";

export const onKeydown = (editor: Editor, event: KeyboardEvent) => {
  if (event.defaultPrevented) return
  const { selection } = editor
  const element = editor.children[selection !== null ? selection.focus.path[0] : 0]
  const isRTL = direction(Node.string(element)) === 'rtl'

  if (Hotkey.isShift(event)) {
    IS_SHIFT_PRESSED.set(editor, true)
  }

  if (Hotkey.isSelectAll(event)) {
    event.preventDefault()
    Transforms.select(editor, Editor.range(editor, []))
    return
  }

  if (Hotkey.isCut(event)) {
    event.preventDefault()
    editor.cut()
    return
  }

  if (Hotkey.isCopy(event)) {
    event.preventDefault()
    editor.copy()
    return
  }

  if (Hotkey.isPaste(event)) {
    IS_PASTE_TEXT.set(editor, false)
    return
  }

  if (Hotkey.isPasteText(event)) {
    IS_PASTE_TEXT.set(editor, true)
    return
  }

  if (Hotkey.isExtendForward(event)) {
    event.preventDefault()
    Transforms.move(editor, { edge: 'focus' })
    return
  }

  if (Hotkey.isExtendBackward(event)) {
    event.preventDefault()
    Transforms.move(editor, { edge: 'focus', reverse: true })
    return
  }

  if (Hotkey.isExtendUp(event)) {
    event.preventDefault()
    const point = Editor.getPreviousLinePoint(editor)
    if (point && selection)
      Transforms.select(editor, {
        anchor: selection.anchor,
        focus: point,
      })
    return
  }

  if (Hotkey.isExtendDown(event)) {
    event.preventDefault()
    const point = Editor.getNextLinePoint(editor)
    if (point && selection)
      Transforms.select(editor, {
        anchor: selection.anchor,
        focus: point,
      })
    return
  }

  if (Hotkey.isMoveUp(event)) {
    event.preventDefault()
    const point = Editor.getPreviousLinePoint(editor)
    if (point) Transforms.select(editor, point)
    return
  }

  if (Hotkey.isMoveDown(event)) {
    event.preventDefault()
    const point = Editor.getNextLinePoint(editor)
    if (point) Transforms.select(editor, point)
    return
  }

  if (Hotkey.isExtendLineBackward(event)) {
    event.preventDefault()
    Transforms.move(editor, {
      unit: 'line',
      edge: 'focus',
      reverse: true,
    })
    return
  }

  if (Hotkey.isExtendLineForward(event)) {
    event.preventDefault()
    Transforms.move(editor, { unit: 'line', edge: 'focus' })
    return
  }

  if (Hotkey.isMoveWordBackward(event)) {
    event.preventDefault()

    if (selection && Range.isExpanded(selection)) {
      Transforms.collapse(editor, { edge: 'focus' })
    }
    if (selection) {
      const { focus } = selection
      const { path: focusPath } = focus
      if (Editor.isStart(editor, focus, focusPath)) {
        Transforms.move(editor, { reverse: !isRTL })
        return
      }
      const { text, offset } = Editor.getBlockTextAndOffsetFromPoint(editor, focus)
      if (text) {
        const wordOffset = getWordOffsetBackwardFromOffset(text, offset)
        const newPoint = Editor.getSubPointFromBlockTextAndOffset(editor, focusPath, wordOffset)
        Transforms.select(editor, newPoint)
        return
      }
    }
    Transforms.move(editor, { unit: 'word', reverse: !isRTL })
    return
  }

  if (Hotkey.isMoveWordForward(event)) {
    event.preventDefault()

    if (selection && Range.isExpanded(selection)) {
      Transforms.collapse(editor, { edge: 'focus' })
    }
    if (selection) {
      const { focus } = selection
      const { path: focusPath } = focus
      if (Editor.isEnd(editor, focus, focusPath)) {
        Transforms.move(editor, { reverse: isRTL })
        return
      }
      const { text, offset } = Editor.getBlockTextAndOffsetFromPoint(editor, focus)
      if (text) {
        const wordOffset = getWordOffsetForwardFromOffset(text, offset)
        Transforms.select(editor, Editor.getSubPointFromBlockTextAndOffset(editor, focusPath, wordOffset))
        return
      }
    }
    Transforms.move(editor, { unit: 'word', reverse: isRTL })
    return
  }

  if (Hotkey.isMoveBackward(event)) {
    event.preventDefault()

    if (selection && Range.isCollapsed(selection)) {
      Transforms.move(editor, { reverse: !isRTL })
    } else {
      Transforms.collapse(editor, { edge: 'start' })
    }

    return
  }

  if (Hotkey.isMoveForward(event)) {
    event.preventDefault()

    if (selection && Range.isCollapsed(selection)) {
      Transforms.move(editor, { reverse: isRTL })
    } else {
      Transforms.collapse(editor, { edge: 'end' })
    }

    return
  }

  if (Hotkey.isMoveLineStart(event)) {
    event.preventDefault()

    const point = Editor.getLineEdgePoint(editor)
    if (point) {
      Transforms.select(editor, point)
    }

    return
  }

  if (Hotkey.isMoveLineEnd(event)) {
    event.preventDefault()

    const point = Editor.getLineEdgePoint(editor, { edge: 'end' })
    if (point) {
      Transforms.select(editor, point)
    }

    return
  }

  if (Hotkey.isMoveEditorStart(event)) {
    event.preventDefault()

    editor.focus(true)

    return
  }

  if (Hotkey.isMoveEditorEnd(event)) {
    event.preventDefault()

    editor.focus(false)

    return
  }

  if (Hotkey.isSoftBreak(event)) {
    event.preventDefault()
    Editor.insertSoftBreak(editor)
    return
  }

  if (Hotkey.isSplitBlock(event)) {
    event.preventDefault()
    Editor.insertBreak(editor)
    return
  }

  if (Hotkey.isDeleteBackward(event)) {
    event.preventDefault()
    if (selection && Range.isExpanded(selection)) {
      Editor.deleteFragment(editor)
    } else {
      Editor.deleteBackward(editor)
    }
    return
  }

  if (Hotkey.isDeleteForward(event)) {
    event.preventDefault()

    if (selection && Range.isExpanded(selection)) {
      Editor.deleteFragment(editor, { direction: 'forward' })
    } else {
      Editor.deleteForward(editor)
    }

    return
  }

  if (Hotkey.isDeleteLineBackward(event)) {
    event.preventDefault()

    if (selection && Range.isExpanded(selection)) {
      Editor.deleteFragment(editor, { direction: 'backward' })
    } else {
      Editor.deleteBackward(editor, { unit: 'line' })
    }

    return
  }

  if (Hotkey.isDeleteLineForward(event)) {
    event.preventDefault()

    if (selection && Range.isExpanded(selection)) {
      Editor.deleteFragment(editor, { direction: 'forward' })
    } else {
      Editor.deleteForward(editor, { unit: 'line' })
    }

    return
  }

  if (Hotkey.isDeleteWordBackward(event)) {
    event.preventDefault()

    if (selection && Range.isExpanded(selection)) {
      Editor.deleteFragment(editor, { direction: 'backward' })
    } else {
      Editor.deleteBackward(editor, { unit: 'word' })
    }

    return
  }

  if (Hotkey.isDeleteWordForward(event)) {
    event.preventDefault()

    if (selection && Range.isExpanded(selection)) {
      Editor.deleteFragment(editor, { direction: 'forward' })
    } else {
      Editor.deleteForward(editor, { unit: 'word' })
    }

    return
  }
}
