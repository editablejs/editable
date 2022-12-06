import { Descendant, Editor, Transforms } from '@editablejs/editor'
import * as Y from 'yjs'
import { HistoryStackItem, RelativeRange } from '../types'
import { relativeRangeToSlateRange, slateRangeToRelativeRange } from '../utils/position'
import { YjsEditor } from './yjs'

const LAST_SELECTION: WeakMap<Editor, RelativeRange | null> = new WeakMap()
const DEFAULT_WITHOUT_SAVING_ORIGIN = Symbol('slate-yjs-history-without-saving')

export type YHistoryEditor = YjsEditor & {
  undoManager: Y.UndoManager

  withoutSavingOrigin: unknown

  undo: () => void
  redo: () => void
}

export const YHistoryEditor = {
  isYHistoryEditor(value: unknown): value is YHistoryEditor {
    return (
      YjsEditor.isYjsEditor(value) &&
      (value as YHistoryEditor).undoManager instanceof Y.UndoManager &&
      typeof (value as YHistoryEditor).undo === 'function' &&
      typeof (value as YHistoryEditor).redo === 'function' &&
      'withoutSavingOrigin' in value
    )
  },

  canUndo(editor: YHistoryEditor) {
    return editor.undoManager.undoStack.length > 0
  },

  canRedo(editor: YHistoryEditor) {
    return editor.undoManager.redoStack.length > 0
  },

  isSaving(editor: YHistoryEditor): boolean {
    return editor.undoManager.trackedOrigins.has(YjsEditor.origin(editor))
  },

  withoutSaving(editor: YHistoryEditor, fn: () => void) {
    YjsEditor.withOrigin(editor, editor.withoutSavingOrigin, fn)
  },
}

export type WithYHistoryOptions = NonNullable<ConstructorParameters<typeof Y.UndoManager>[1]> & {
  withoutSavingOrigin?: unknown
}

export function withYHistory<T extends YjsEditor>(
  editor: T,
  {
    withoutSavingOrigin = DEFAULT_WITHOUT_SAVING_ORIGIN,
    trackedOrigins = new Set([editor.localOrigin]),
    ...options
  }: WithYHistoryOptions = {},
): T & YHistoryEditor {
  const e = editor as T & YHistoryEditor

  const undoManager = new Y.UndoManager(e.sharedRoot, {
    trackedOrigins,
    ...options,
  })

  e.undoManager = undoManager
  e.withoutSavingOrigin = withoutSavingOrigin

  const { onChange, isLocalOrigin } = e
  e.onChange = () => {
    onChange()
    if (YjsEditor.connected(e))
      LAST_SELECTION.set(e, e.selection && slateRangeToRelativeRange(e.sharedRoot, e, e.selection))
  }

  e.isLocalOrigin = origin => origin === e.withoutSavingOrigin || isLocalOrigin(origin)

  const handleStackItemAdded = ({
    stackItem,
  }: {
    stackItem: HistoryStackItem
    type: 'redo' | 'undo'
  }) => {
    stackItem.meta.set(
      'selection',
      e.selection && slateRangeToRelativeRange(e.sharedRoot, e, e.selection),
    )
    stackItem.meta.set('selectionBefore', LAST_SELECTION.get(e))
  }

  const handleStackItemUpdated = ({
    stackItem,
  }: {
    stackItem: HistoryStackItem
    type: 'redo' | 'undo'
  }) => {
    stackItem.meta.set(
      'selection',
      e.selection && slateRangeToRelativeRange(e.sharedRoot, e, e.selection),
    )
  }

  const handleStackItemPopped = ({
    stackItem,
    type,
  }: {
    stackItem: HistoryStackItem
    type: 'redo' | 'undo'
  }) => {
    // TODO: Change once https://github.com/yjs/yjs/issues/353 is resolved
    const inverseStack = type === 'undo' ? e.undoManager.redoStack : e.undoManager.undoStack
    const inverseItem = inverseStack[inverseStack.length - 1]
    if (inverseItem) {
      inverseItem.meta.set('selection', stackItem.meta.get('selectionBefore'))
      inverseItem.meta.set('selectionBefore', stackItem.meta.get('selection'))
    }

    const relativeSelection = stackItem.meta.get('selectionBefore') as RelativeRange | null

    if (!relativeSelection) {
      return
    }

    const selection = relativeRangeToSlateRange(e.sharedRoot, e, relativeSelection)

    if (!selection) {
      return
    }

    Transforms.select(e, selection)
  }

  const { connect, disconnect } = e
  e.connect = () => {
    connect()

    e.undoManager.on('stack-item-added', handleStackItemAdded)
    e.undoManager.on('stack-item-popped', handleStackItemPopped)
    e.undoManager.on('stack-item-updated', handleStackItemUpdated)
  }

  e.disconnect = () => {
    e.undoManager.off('stack-item-added', handleStackItemAdded)
    e.undoManager.off('stack-item-popped', handleStackItemPopped)
    e.undoManager.off('stack-item-updated', handleStackItemUpdated)

    disconnect()
  }

  const { undo, redo } = e

  e.undo = () => {
    if (YjsEditor.connected(e)) {
      YjsEditor.flushLocalChanges(e)
      e.undoManager.undo()
    } else if (undo) {
      undo()
    }
  }

  e.redo = () => {
    if (YjsEditor.connected(e)) {
      YjsEditor.flushLocalChanges(e)
      e.undoManager.redo()
    } else if (redo) {
      redo()
    }
  }

  return e
}
