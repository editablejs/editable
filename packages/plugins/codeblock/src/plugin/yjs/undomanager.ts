import * as Y from 'yjs'
import * as cmState from '@codemirror/state'

import * as cmView from '@codemirror/view'
import { ySyncFacet, ySyncAnnotation, YSyncConfig } from './sync'
import { createMutex } from 'lib0/mutex'
import { YRange } from './range'

export class YUndoManagerConfig {
  undoManager: Y.UndoManager

  constructor(undoManager: Y.UndoManager) {
    this.undoManager = undoManager
  }

  addTrackedOrigin(origin: any) {
    this.undoManager.addTrackedOrigin(origin)
  }

  removeTrackedOrigin(origin: any) {
    this.undoManager.removeTrackedOrigin(origin)
  }

  undo() {
    return this.undoManager.undo() != null
  }

  redo() {
    return this.undoManager.redo() != null
  }
}

export const yUndoManagerFacet = cmState.Facet.define<YUndoManagerConfig, YUndoManagerConfig>({
  combine(inputs) {
    return inputs[inputs.length - 1]
  },
})

export const yUndoManagerAnnotation = cmState.Annotation.define<YUndoManagerConfig>()

class YUndoManagerPluginValue implements cmView.PluginValue {
  view: cmView.EditorView
  conf: YUndoManagerConfig
  _undoManager: Y.UndoManager
  syncConf: YSyncConfig
  _beforeChangeSelection: null | YRange
  _mux: any
  _onStackItemAdded: ({
    stackItem,
    changedParentTypes,
  }: {
    stackItem: any
    changedParentTypes: any
  }) => void
  _onStackItemPopped: ({ stackItem }: { stackItem: any }) => void
  /**
   * @param {cmView.EditorView} view
   */
  constructor(view: cmView.EditorView) {
    this.view = view
    this.conf = view.state.facet(yUndoManagerFacet)
    this._undoManager = this.conf.undoManager
    this.syncConf = view.state.facet(ySyncFacet)

    this._beforeChangeSelection = null
    this._mux = createMutex()

    this._onStackItemAdded = ({ stackItem, changedParentTypes }) => {
      // only store metadata if this type was affected
      if (
        changedParentTypes.has(this.syncConf.ytext) &&
        this._beforeChangeSelection &&
        !stackItem.meta.has(this)
      ) {
        // do not overwrite previous stored selection
        stackItem.meta.set(this, this._beforeChangeSelection)
      }
    }
    this._onStackItemPopped = ({ stackItem }) => {
      const sel = stackItem.meta.get(this)
      if (sel) {
        const selection = this.syncConf.fromYRange(sel)
        view.dispatch(view.state.update({ selection }))
        this._storeSelection()
      }
    }
    /**
     * Do this without mutex, simply use the sync annotation
     */
    this._storeSelection = () => {
      // store the selection before the change is applied so we can restore it with the undo manager.
      this._beforeChangeSelection = this.syncConf.toYRange(this.view.state.selection.main)
    }
    this._undoManager.on('stack-item-added', this._onStackItemAdded)
    this._undoManager.on('stack-item-popped', this._onStackItemPopped)
    this._undoManager.addTrackedOrigin(this.syncConf)
  }
  _storeSelection() {
    throw new Error('Method not implemented.')
  }

  update(update: cmView.ViewUpdate) {
    if (
      update.selectionSet &&
      (update.transactions.length === 0 ||
        update.transactions[0].annotation(ySyncAnnotation) !== this.syncConf)
    ) {
      // This only works when YUndoManagerPlugin is included before the sync plugin
      this._storeSelection()
    }
  }

  destroy() {
    this._undoManager.off('stack-item-added', this._onStackItemAdded)
    this._undoManager.off('stack-item-popped', this._onStackItemPopped)
    this._undoManager.removeTrackedOrigin(this.syncConf)
  }
}
export const yUndoManager = cmView.ViewPlugin.fromClass(YUndoManagerPluginValue)

export const undo: cmState.StateCommand = ({ state, dispatch }) =>
  state.facet(yUndoManagerFacet).undo() || true

export const redo: cmState.StateCommand = ({ state, dispatch }) =>
  state.facet(yUndoManagerFacet).redo() || true

export const undoDepth = (state: cmState.EditorState) =>
  state.facet(yUndoManagerFacet).undoManager.undoStack.length

export const redoDepth = (state: cmState.EditorState) =>
  state.facet(yUndoManagerFacet).undoManager.redoStack.length

export const yUndoManagerKeymap: cmView.KeyBinding[] = [
  { key: 'Mod-z', run: undo, preventDefault: true },
  { key: 'Mod-y', mac: 'Mod-Shift-z', run: redo, preventDefault: true },
  { key: 'Mod-Shift-z', run: redo, preventDefault: true },
]
