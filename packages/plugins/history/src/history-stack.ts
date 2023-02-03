import { isPlainObject } from 'is-plain-object'
import { Editor, Operation, Range } from '@editablejs/models'

interface Batch {
  operations: Operation[]
  selectionBefore: Range | null
}

const HISTORY_STACK = new WeakMap<Editor, HistoryStack>()
/**
 * `History` objects hold all of the operations that are applied to a value, so
 * they can be undone or redone as necessary.
 */

export interface HistoryStack {
  redos: Batch[]
  undos: Batch[]
}

// eslint-disable-next-line no-redeclare
export const HistoryStack = {
  /**
   * Check if a value is a `History` object.
   */

  isHistoryStack(value: any): value is HistoryStack {
    return (
      isPlainObject(value) &&
      Array.isArray(value.redos) &&
      Array.isArray(value.undos) &&
      (value.redos.length === 0 || Operation.isOperationList(value.redos[0].operations)) &&
      (value.undos.length === 0 || Operation.isOperationList(value.undos[0].operations))
    )
  },

  set(editor: Editor, stack: HistoryStack = { undos: [], redos: [] }): void {
    HISTORY_STACK.set(editor, stack)
  },

  get(editor: Editor): HistoryStack {
    const stack = HISTORY_STACK.get(editor)
    if (!stack) throw new Error('History stack is not defined')
    return stack
  },

  hasUndos(editor: Editor): boolean {
    const stack = HistoryStack.get(editor)
    const { undos } = stack
    return undos.length > 0
  },

  hasRedos(editor: Editor): boolean {
    const stack = HistoryStack.get(editor)
    const { redos } = stack
    return redos.length > 0
  },
}
