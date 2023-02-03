import * as Y from 'yjs'
import { Annotation, Compartment, Extension, Facet, StateEffect } from '@codemirror/state'
import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { Editable } from '@editablejs/editor'
import { YJS_DOC_WEAK_MAP, YJS_AWARENESS_WEAK_MAP } from '../../weak-map'
import { CODEBLOCK_YJS_FIELD, CODEBLOCK_YJS_KEY } from '../../constants'
import { ySync, YSyncConfig, ySyncFacet } from './sync'
import { Awareness } from '@editablejs/yjs-protocols/awareness'
import { ProviderProtocol, withProviderProtocol } from '@editablejs/protocols/provider'
import { yRemoteSelections } from './remote-selecton'
import { undo, redo } from '@codemirror/commands'
import { yUndoManagerFacet, YUndoManagerConfig, yUndoManager } from './undomanager'

export class YExtensionConfig {
  id: string
  editor: Editable
  doc?: Y.Doc
  awareness?: Awareness

  constructor(id: string, editor: Editable) {
    this.id = id
    this.editor = editor
    this.doc = YJS_DOC_WEAK_MAP.get(editor)
    this.awareness = YJS_AWARENESS_WEAK_MAP.get(editor)
  }
}

export const ySyncAnnotation = Annotation.define<YExtensionConfig>()

export const yExtensionnFacet = Facet.define<YExtensionConfig, YExtensionConfig>({
  combine(inputs) {
    return inputs[inputs.length - 1]
  },
})

export class YExtension {
  view: EditorView
  config: YExtensionConfig
  extension: Extension[] = []
  yCompartment = new Compartment()
  isLoaded = false
  providerProtocol: ProviderProtocol
  yText: Y.Text | null = null

  constructor(view: EditorView) {
    this.view = view
    this.config = view.state.facet(yExtensionnFacet)
    const providerProtocol = withProviderProtocol(this.config.editor)
    providerProtocol.on('connected', this.loadDoc)
    providerProtocol.on('disconnected', this.destroyDoc)
    this.providerProtocol = providerProtocol
  }

  // view
  loadDoc = () => {
    const { doc: document, id, awareness, editor } = this.config
    if (!document || !awareness) return
    const doc = document.getMap<Y.Doc>(CODEBLOCK_YJS_KEY).get(id)
    if (!doc) return
    const yText = doc.getText(CODEBLOCK_YJS_FIELD)
    this.yText = yText
    doc.load()
    const ySyncConfig = new YSyncConfig(id, yText, awareness, editor)
    const undoManager = new Y.UndoManager(yText)
    this.extension = [
      yRemoteSelections,
      ySyncFacet.of(ySyncConfig),
      ySync,
      // undoManager
      yUndoManagerFacet.of(new YUndoManagerConfig(undoManager)),
      yUndoManager,
      EditorView.domEventHandlers({
        beforeinput(e, view) {
          if (e.inputType === 'historyUndo') return undo(view)
          if (e.inputType === 'historyRedo') return redo(view)
          return false
        },
      }),
    ]
    this.dispatchEffects()
  }

  destroyDoc = () => {
    // const { doc: document, id } = this.config
    // if (!document) return
    // const doc = document.getMap<Y.Doc>(CODEBLOCK_YJS_KEY).get(id)
    // if (!doc) return
    // doc.destroy()
    this.extension = []
    this.dispatchEffects()
  }

  dispatchEffects() {
    const v = this.view
    if (!this.yCompartment.get(v.state)) {
      v.dispatch({ effects: StateEffect.appendConfig.of(this.yCompartment.of(this.extension)) })
    } else {
      v.dispatch({ effects: this.yCompartment.reconfigure(this.extension) })
    }
  }

  update(_: ViewUpdate) {
    if (!this.isLoaded) {
      setTimeout(() => {
        if (this.providerProtocol.connected()) this.loadDoc()
      }, 0)
      this.isLoaded = true
    }
  }

  destroy() {
    this.destroyDoc()
    this.providerProtocol.off('connected', this.loadDoc)
    this.providerProtocol.off('disconnected', this.destroyDoc)
  }
}

export const yExtension = ViewPlugin.fromClass(YExtension)
