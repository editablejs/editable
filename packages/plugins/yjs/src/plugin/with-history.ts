import { Editor, Operation, Transforms } from '@editablejs/models'
import { editorRangeToRelativeRange, relativeRangeToEditorRange } from '@editablejs/yjs-transform'
import { withHistoryProtocol } from '@editablejs/protocols/history'
import { withProviderProtocol } from '@editablejs/protocols/provider'
import * as Y from 'yjs'
import { HistoryStackItem, RelativeRange } from '../types'
import { YjsEditor } from './with-yjs'

const LAST_SELECTION: WeakMap<Editor, RelativeRange | null> = new WeakMap()
const DEFAULT_WITHOUT_SAVING_ORIGIN = Symbol('editable-yjs-history-without-saving')

export type YHistoryEditor = YjsEditor & {
  undoManager: Y.UndoManager

  withoutSavingOrigin: unknown
}

export const YHistoryEditor = {
  isYHistoryEditor(value: unknown): value is YHistoryEditor {
    return (
      YjsEditor.isYjsEditor(value) &&
      (value as YHistoryEditor).undoManager instanceof Y.UndoManager &&
      'withoutSavingOrigin' in value
    )
  },

  canUndo(editor: Editor) {
    return withHistoryProtocol(editor).canUndo()
  },

  canRedo(editor: Editor) {
    return withHistoryProtocol(editor).canRedo()
  },

  undo(editor: Editor) {
    withHistoryProtocol(editor).undo()
  },

  redo(editor: Editor) {
    withHistoryProtocol(editor).redo()
  },

  isSaving(editor: Editor): boolean {
    if (YHistoryEditor.isYHistoryEditor(editor))
      return editor.undoManager.trackedOrigins.has(YjsEditor.origin(editor))
    return false
  },

  withoutSaving(editor: Editor, fn: () => void) {
    if (YHistoryEditor.isYHistoryEditor(editor))
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

  const providerProtocol = withProviderProtocol(e)

  const { connect, disconnect } = providerProtocol
  providerProtocol.connect = () => {
    connect()
    e.undoManager.on('stack-item-added', handleStackItemAdded)
    e.undoManager.on('stack-item-popped', handleStackItemPopped)
    e.undoManager.on('stack-item-updated', handleStackItemUpdated)
  }

  providerProtocol.disconnect = () => {
    e.undoManager.off('stack-item-added', handleStackItemAdded)
    e.undoManager.off('stack-item-popped', handleStackItemPopped)
    e.undoManager.off('stack-item-updated', handleStackItemUpdated)

    disconnect()
  }

  const historyProtocol = withHistoryProtocol(e)

  const HistoryTransactionMeta = new Map<any, Map<any, any>>()
  const undoManager = new Y.UndoManager(e.sharedRoot, {
    trackedOrigins,
    captureTransaction: t => {
      const ops: Operation[] = t.meta.get('ops') ?? []
      if (!ops.every(op => historyProtocol.capture(op))) return false
      // 设置捕获到的事务 meta
      // 在后面的 handleStackItemMeta 中会将事务 meta 设置到 stackItem 中
      if (
        undoManager.scope.some(type => t.changedParentTypes.has(type)) &&
        (undoManager.trackedOrigins.has(t.origin) ||
          (t.origin && undoManager.trackedOrigins.has(t.origin.constructor)))
      )
        HistoryTransactionMeta.set(t.origin, t.meta)
      return true
    },
    ...options,
  })

  e.undoManager = undoManager
  e.withoutSavingOrigin = withoutSavingOrigin

  const { onChange, isLocalOrigin } = e
  e.onChange = () => {
    onChange()
    if (providerProtocol.connected())
      LAST_SELECTION.set(e, e.selection && editorRangeToRelativeRange(e.sharedRoot, e, e.selection))
  }

  e.isLocalOrigin = origin => origin === e.withoutSavingOrigin || isLocalOrigin(origin)

  const handleStackItemMeta = (origin: unknown, stackItem: HistoryStackItem) => {
    const meta = HistoryTransactionMeta.get(origin)
    if (meta) {
      for (const [key, value] of meta) {
        stackItem.meta.set(key, value)
      }
    }
    HistoryTransactionMeta.delete(origin)
  }

  const handleStackItemAdded = ({
    stackItem,
    origin,
  }: {
    stackItem: HistoryStackItem
    type: 'redo' | 'undo'
    origin: unknown
  }) => {
    stackItem.meta.set(
      'selection',
      e.selection && editorRangeToRelativeRange(e.sharedRoot, e, e.selection),
    )
    stackItem.meta.set('selectionBefore', LAST_SELECTION.get(e))
    handleStackItemMeta(origin, stackItem)
  }

  const handleStackItemUpdated = ({
    stackItem,
  }: {
    stackItem: HistoryStackItem
    type: 'redo' | 'undo'
  }) => {
    stackItem.meta.set(
      'selection',
      e.selection && editorRangeToRelativeRange(e.sharedRoot, e, e.selection),
    )
    handleStackItemMeta(origin, stackItem)
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

    const selection = relativeRangeToEditorRange(e.sharedRoot, e, relativeSelection)

    if (!selection) {
      return
    }

    Transforms.select(e, selection)
  }

  const { undo, redo, canRedo, canUndo, capture } = historyProtocol

  // 获取到 undo/redo 时的 Transaction
  // 在 handleHistoryBeforeTransaction 中会将该 Transaction 设置到 popStackItemTransaction 中
  // 在执行 undo/redo 时，将 meta 中的 ops 设置到 Transaction 中
  // 具体信息可以参考它的源码 https://github.com/yjs/yjs/blob/main/src/utils/UndoManager.js#L53
  let popStackItemTransaction: Y.Transaction | null = null
  const handleHistoryBeforeTransaction = (transaction: Y.Transaction) => {
    if (transaction.origin === e.undoManager) {
      popStackItemTransaction = transaction
    }
  }

  historyProtocol.capture = op => {
    if (providerProtocol.connected()) return true
    return capture(op)
  }

  historyProtocol.undo = () => {
    if (providerProtocol.connected()) {
      YjsEditor.flushLocalChanges(e)
      const manager = e.undoManager
      const undoStack = manager.undoStack
      const { pop } = undoStack
      // 执行 undo 时，将 undoStack 的 pop 方法替换为自定义的方法
      // 在自定义的方法中，将 undoStack 中的操作转换为 inverse 操作并设置到 Transaction 的 meta 中
      // 这样 undo 时，也会携带 meta 信息并且广播出去，这样就可以保证更新到其它客户端的 RangeRef PathRef PointRef
      undoStack.pop = () => {
        const item = pop.call(undoStack)
        if (item) {
          const meta = item.meta
          const ops = meta.get('ops') ?? []
          const inverseOps = ops.map(Operation.inverse).reverse()
          popStackItemTransaction?.meta.set('ops', inverseOps)
        }
        return item
      }
      manager.doc.on('beforeTransaction', handleHistoryBeforeTransaction)
      manager.undo()
      undoStack.pop = pop
      manager.doc.off('beforeTransaction', handleHistoryBeforeTransaction)
    } else {
      undo()
    }
  }

  historyProtocol.redo = () => {
    if (providerProtocol.connected()) {
      YjsEditor.flushLocalChanges(e)
      const manager = e.undoManager
      const redoStack = manager.redoStack
      const { pop } = redoStack
      redoStack.pop = () => {
        const item = pop.call(redoStack)
        if (item) {
          const meta = item.meta
          const ops = meta.get('ops') ?? []
          const inverseOps = ops.map(Operation.inverse).reverse()
          popStackItemTransaction?.meta.set('ops', inverseOps)
        }
        return item
      }
      manager.doc.on('beforeTransaction', handleHistoryBeforeTransaction)
      manager.redo()
      redoStack.pop = pop
      manager.doc.off('beforeTransaction', handleHistoryBeforeTransaction)
    } else {
      redo()
    }
  }

  historyProtocol.canRedo = () => {
    if (providerProtocol.connected()) {
      return e.undoManager.redoStack.length > 0
    } else return canRedo()
  }

  historyProtocol.canUndo = () => {
    if (providerProtocol.connected()) {
      return e.undoManager.undoStack.length > 0
    } else return canUndo()
  }

  return e
}
