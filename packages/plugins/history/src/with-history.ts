import {
  Editor,
  InsertNodeOperation,
  Operation,
  Path,
  Node,
  Transforms,
  CompositionText,
} from '@editablejs/models'
import { Editable, Hotkey } from '@editablejs/editor'
import { withHistoryProtocol } from '@editablejs/protocols/history'

import { HistoryEditor } from './history-editor'
import { HistoryStack } from './history-stack'

const HISTORY_UNDO_KEY = 'undo'
const HISTORY_REDO_KEY = 'redo'

type HistoryType = typeof HISTORY_UNDO_KEY | typeof HISTORY_REDO_KEY

export type Hotkeys = Record<HistoryType, string | string[] | ((e: KeyboardEvent) => boolean)>

const defaultHotkeys: Hotkeys = {
  [HISTORY_UNDO_KEY]: 'mod+z',
  [HISTORY_REDO_KEY]: ['mod+y', 'mod+shift+z'],
}

export interface HistoryOptions {
  hotkey?: Hotkeys
  delay?: number
}

export const withHistory = <T extends Editable>(editor: T, options: HistoryOptions = {}) => {
  const e = editor as T & HistoryEditor
  const { apply } = e

  HistoryStack.set(e)
  const historyProtocol = withHistoryProtocol(e)
  const { redo, undo, canRedo, canUndo, capture } = historyProtocol

  historyProtocol.redo = () => {
    if (!HistoryEditor.isHistoryEditor(editor)) return redo()
    const stack = HistoryStack.get(editor)
    const { redos, undos } = stack

    if (redos.length > 0) {
      const batch = redos[redos.length - 1]

      if (batch.selectionBefore) {
        Transforms.setSelection(editor, batch.selectionBefore)
      }

      HistoryEditor.withoutSaving(editor, () => {
        Editor.withoutNormalizing(editor, () => {
          for (const op of batch.operations) {
            editor.apply(op)
          }
        })
      })
      redos.pop()
      undos.push(batch)
    }
  }

  historyProtocol.undo = () => {
    if (!HistoryEditor.isHistoryEditor(editor)) return undo()
    const stack = HistoryStack.get(editor)
    const { undos, redos } = stack

    if (undos.length > 0) {
      const batch = undos[undos.length - 1]

      HistoryEditor.withoutSaving(editor, () => {
        Editor.withoutNormalizing(editor, () => {
          const inverseOps = batch.operations.map(Operation.inverse).reverse()

          for (const op of inverseOps) {
            editor.apply(op)
          }
          if (batch.selectionBefore) {
            Transforms.setSelection(e, batch.selectionBefore)
          }
        })
      })

      redos.push(batch)
      undos.pop()
    }
  }

  historyProtocol.canRedo = () => {
    if (!HistoryEditor.isHistoryEditor(e)) return canRedo()
    return HistoryStack.hasRedos(e)
  }

  historyProtocol.canUndo = () => {
    if (!HistoryEditor.isHistoryEditor(e)) return canUndo()
    return HistoryStack.hasUndos(e)
  }

  historyProtocol.capture = op => {
    if (!HistoryEditor.isHistoryEditor(e)) return capture(op)
    return op.type !== 'set_selection'
  }

  let changeTime = Date.now()
  const { delay } = options
  e.apply = (op: Operation) => {
    const stack = HistoryStack.get(e)
    const { operations } = e
    const { undos } = stack
    const lastBatch = undos[undos.length - 1]
    const lastOp = lastBatch && lastBatch.operations[lastBatch.operations.length - 1]

    let save = HistoryEditor.isSaving(e)
    let merge = HistoryEditor.isMerging(e)

    if (save == null) {
      save = historyProtocol.capture(op)
    }
    if (save && !Editable.isComposing(e)) {
      if (merge == null) {
        if (delay !== undefined) {
          if (Date.now() - changeTime > delay) {
            merge = false
          } else {
            merge = true
          }
          changeTime = Date.now()
        } else if (lastBatch == null) {
          merge = false
        } else if (operations.length !== 0 && shouldMerge(op, lastOp, true)) {
          merge = true
        } else {
          merge = shouldMerge(op, lastOp)
        }
      }

      if (lastBatch && merge) {
        lastBatch.operations.push(op)
      } else {
        const batch = {
          operations: [op],
          selectionBefore: e.selection,
        }
        undos.push(batch)
      }

      while (undos.length > 100) {
        undos.shift()
      }
      stack.redos = []
    } else if (
      // 在 captureHistory 为 false 的情况下，如果是 set_node 操作，那么就要把 undo 中的对应的 insert_node 操作的 node 属性也更新一下
      !save &&
      op.type === 'set_node'
    ) {
      const { path, newProperties } = op
      for (const undo of undos) {
        const predicate = (op: Operation): op is InsertNodeOperation =>
          op.type === 'insert_node' && Path.equals(op.path, path)
        const op: InsertNodeOperation | undefined = undo.operations.find(predicate)
        if (op) {
          for (const k in newProperties) {
            if (k === 'children' || k === 'type') continue
            const v = newProperties[k as keyof Node]
            const node = { ...op.node, [k]: v }
            op.node = node
          }
          break
        }
      }
    }

    apply(op)
  }

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkey)
  const { onKeydown } = e
  e.onKeydown = (event: KeyboardEvent) => {
    const value = Hotkey.match(hotkeys, event)
    if (value) {
      event.preventDefault()
      if (value === HISTORY_UNDO_KEY) {
        historyProtocol.undo()
      } else {
        historyProtocol.redo()
      }
      return
    }
    onKeydown(event)
  }

  return e
}

/**
 * Check whether to merge an operation into the previous operation.
 */
const shouldMerge = (op: Operation, prev: Operation | undefined, defaultMerge = false): boolean => {
  if (prev && op.type === 'insert_text' && prev.type === 'insert_text') {
    return op.offset === prev.offset + prev.text.length && Path.equals(op.path, prev.path)
  }

  if (
    prev &&
    op.type === 'remove_text' &&
    prev.type === 'remove_text' &&
    Path.equals(op.path, prev.path) &&
    op.offset + op.text.length === prev.offset
  ) {
    return true
  }

  return defaultMerge
}
