import { Editable, Editor } from '@editablejs/editor'
import { getHistoryProtocol } from '@editablejs/plugin-protocols/history'
import { HistoryStack } from './history-stack'

/**
 * Weakmaps for attaching state to the editor.
 */

export const SAVING = new WeakMap<Editable, boolean | undefined>()
export const MERGING = new WeakMap<Editable, boolean | undefined>()

/**
 * `HistoryEditor` contains helpers for history-enabled editors.
 */

export interface HistoryEditor extends Editable {}

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

  isMerging(editor: Editable): boolean | undefined {
    return MERGING.get(editor)
  },

  /**
   * Get the saving flag's current value.
   */

  isSaving(editor: Editable): boolean | undefined {
    return SAVING.get(editor)
  },

  /**
   * Redo to the previous saved state.
   */

  redo(editor: Editable): void {
    getHistoryProtocol(editor).redo()
  },

  /**
   * Undo to the previous saved state.
   */
  undo(editor: Editable): void {
    getHistoryProtocol(editor).undo()
  },

  canRedo(editor: Editable): boolean {
    return getHistoryProtocol(editor).canRedo()
  },

  canUndo(editor: Editable): boolean {
    return getHistoryProtocol(editor).canUndo()
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, without merging any of
   * the new operations into previous save point in the history.
   */
  withoutMerging(editor: Editable, fn: () => void): void {
    const prev = HistoryEditor.isMerging(editor)
    MERGING.set(editor, false)
    fn()
    MERGING.set(editor, prev)
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, without saving any of
   * their operations into the history.
   */

  withoutSaving(editor: Editable, fn: () => void): void {
    const prev = HistoryEditor.isSaving(editor)
    SAVING.set(editor, false)
    fn()
    SAVING.set(editor, prev)
  },
}
