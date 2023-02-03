import { Editor } from '@editablejs/models'
import { withHistoryProtocol } from '@editablejs/protocols/history'
import { HistoryStack } from './history-stack'

/**
 * Weakmaps for attaching state to the editor.
 */

export const SAVING = new WeakMap<Editor, boolean | undefined>()
export const MERGING = new WeakMap<Editor, boolean | undefined>()

/**
 * `HistoryEditor` contains helpers for history-enabled editors.
 */

export interface HistoryEditor extends Editor {}

// eslint-disable-next-line no-redeclare
export const HistoryEditor = {
  /**
   * Check if a value is a `HistoryEditor` object.
   */
  isHistoryEditor(value: any): value is HistoryEditor {
    return Editor.isEditor(value) && HistoryStack.isHistoryStack(HistoryStack.get(value))
  },

  /**
   * Get the merge flag's current value.
   */

  isMerging(editor: Editor): boolean | undefined {
    return MERGING.get(editor)
  },

  /**
   * Get the saving flag's current value.
   */

  isSaving(editor: Editor): boolean | undefined {
    return SAVING.get(editor)
  },

  /**
   * Redo to the previous saved state.
   */

  redo(editor: Editor): void {
    withHistoryProtocol(editor).redo()
  },

  /**
   * Undo to the previous saved state.
   */
  undo(editor: Editor): void {
    withHistoryProtocol(editor).undo()
  },

  canRedo(editor: Editor): boolean {
    return withHistoryProtocol(editor).canRedo()
  },

  canUndo(editor: Editor): boolean {
    return withHistoryProtocol(editor).canUndo()
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, without merging any of
   * the new operations into previous save point in the history.
   */
  withoutMerging(editor: Editor, fn: () => void): void {
    const prev = HistoryEditor.isMerging(editor)
    MERGING.set(editor, false)
    fn()
    MERGING.set(editor, prev)
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, without saving any of
   * their operations into the history.
   */

  withoutSaving(editor: Editor, fn: () => void): void {
    const prev = HistoryEditor.isSaving(editor)
    SAVING.set(editor, false)
    fn()
    SAVING.set(editor, prev)
  },
}
