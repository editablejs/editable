import {
  Editable,
  Editor,
  Hotkey,
  InsertNodeOperation,
  Operation,
  Path,
  Node,
  Transforms,
} from '@editablejs/editor'

import { HistoryEditor } from './history-editor'

const HISTORY_UNDO_KEY = 'undo'
const HISTORY_REDO_KEY = 'redo'

type HistoryType = typeof HISTORY_UNDO_KEY | typeof HISTORY_REDO_KEY

export type Hotkeys = Record<HistoryType, string | string[] | ((e: KeyboardEvent) => boolean)>

const defaultHotkeys: Hotkeys = {
  [HISTORY_UNDO_KEY]: 'mod+z',
  [HISTORY_REDO_KEY]: ['mod+y', 'mod+shift+z'],
}

export interface HistoryOptions {
  hotkeys?: Hotkeys
}

export const withHistory = <T extends Editable>(editor: T, options: HistoryOptions = {}) => {
  const e = editor as T & HistoryEditor
  const { apply } = e
  e.history = { undos: [], redos: [] }

  e.redo = () => {
    const { history } = e
    const { redos } = history

    if (redos.length > 0) {
      const batch = redos[redos.length - 1]

      if (batch.selectionBefore) {
        Transforms.setSelection(e, batch.selectionBefore)
      }

      HistoryEditor.withoutSaving(e, () => {
        Editor.withoutNormalizing(e, () => {
          for (const op of batch.operations) {
            e.apply(op)
          }
        })
      })

      history.redos.pop()
      history.undos.push(batch)
    }
  }

  e.undo = () => {
    const { history } = e
    const { undos } = history

    if (undos.length > 0) {
      const batch = undos[undos.length - 1]

      HistoryEditor.withoutSaving(e, () => {
        Editor.withoutNormalizing(e, () => {
          const inverseOps = batch.operations.map(Operation.inverse).reverse()

          for (const op of inverseOps) {
            e.apply(op)
          }
          if (batch.selectionBefore) {
            Transforms.setSelection(e, batch.selectionBefore)
          }
        })
      })

      history.redos.push(batch)
      history.undos.pop()
    }
  }

  e.canRedo = () => {
    return e.history.redos.length > 0
  }

  e.canUndo = () => {
    return e.history.undos.length > 0
  }

  e.captureHistory = op => {
    return op.type !== 'set_selection'
  }

  e.apply = (op: Operation) => {
    const { operations, history } = e
    const { undos } = history
    const lastBatch = undos[undos.length - 1]
    const lastOp = lastBatch && lastBatch.operations[lastBatch.operations.length - 1]
    let save = HistoryEditor.isSaving(e)
    let merge = HistoryEditor.isMerging(e)

    if (save == null) {
      save = e.captureHistory(op)
    }
    if (save && !Editable.isComposing(e)) {
      if (merge == null) {
        if (lastBatch == null) {
          merge = false
        } else if (operations.length !== 0) {
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

      history.redos = []
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

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  const { onKeydown } = e
  e.onKeydown = (event: KeyboardEvent) => {
    const value = Hotkey.match(hotkeys, event)
    if (value) {
      event.preventDefault()
      if (value === HISTORY_UNDO_KEY) {
        e.undo()
      } else {
        e.redo()
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

const shouldMerge = (op: Operation, prev: Operation | undefined): boolean => {
  if (
    prev &&
    op.type === 'insert_text' &&
    prev.type === 'insert_text' &&
    op.offset === prev.offset + prev.text.length &&
    Path.equals(op.path, prev.path)
  ) {
    return true
  }

  if (
    prev &&
    op.type === 'remove_text' &&
    prev.type === 'remove_text' &&
    op.offset + op.text.length === prev.offset &&
    Path.equals(op.path, prev.path)
  ) {
    return true
  }

  return false
}
