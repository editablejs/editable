import * as cmView from '@codemirror/view'
import * as Y from 'yjs'
import { Awareness } from '@editablejs/plugin-yjs-protocols/awareness'
import { createRemoteCursors, RemoteCursors } from '@editablejs/plugin-yjs-protocols/remote-cursors'
import { YSyncConfig, ySyncFacet } from './sync'
import { CODEBLOCK_AWARENESS_FIELD } from '../../constants'
import { Editable } from '@editablejs/editor'

export class YRemoteSelectionsPluginValue {
  conf: YSyncConfig
  _awareness: Awareness
  _remoteCursors: RemoteCursors
  constructor(view: cmView.EditorView) {
    this.conf = view.state.facet(ySyncFacet)

    this._awareness = this.conf.awareness

    const { getAwarenessField, relativeRangeToNativeRange, nativeRangeToRelativeRange } =
      RemoteCursors

    RemoteCursors.getAwarenessField = state => {
      const currentRange = state?.[CODEBLOCK_AWARENESS_FIELD]
      if (currentRange) return CODEBLOCK_AWARENESS_FIELD
      return getAwarenessField(state)
    }

    RemoteCursors.relativeRangeToNativeRange = (awarenessField, range) => {
      if (awarenessField === CODEBLOCK_AWARENESS_FIELD) {
        const ytext = this.conf.ytext
        const editor = this.conf.editor
        const ydoc = ytext.doc
        if (!ydoc) return null
        const anchor = Y.createAbsolutePositionFromRelativePosition(range.anchor, ydoc)
        const head = Y.createAbsolutePositionFromRelativePosition(range.focus, ydoc)
        if (anchor == null || head == null || anchor.type !== ytext || head.type !== ytext) {
          return null
        }
        const editorRange = { anchor: anchor.index, focus: head.index }
        if (!editorRange) return null
        return {
          isBackward: () => editorRange.anchor > editorRange.focus,
          isCollapsed: () => editorRange.anchor === editorRange.focus,
          toRects() {
            const anchor = view.domAtPos(editorRange.anchor)
            const focus = view.domAtPos(editorRange.focus)
            const range = document.createRange()
            range.setEnd(focus.node, focus.offset)
            range.setStart(anchor.node, anchor.offset)
            const rects: DOMRect[] = []
            for (const rect of range.getClientRects()) {
              const [x, y] = Editable.toRelativePosition(editor, rect.x, rect.y)
              rects.push(new DOMRect(x, y, rect.width, rect.height))
            }
            return rects
          },
          ...editorRange,
        }
      }
      return relativeRangeToNativeRange(awarenessField, range)
    }

    RemoteCursors.nativeRangeToRelativeRange = (
      awarenessField,
      range: Record<'anchor' | 'focus', number>,
    ) => {
      if (awarenessField === CODEBLOCK_AWARENESS_FIELD) {
        const ytext = this.conf.ytext
        const anchor = Y.createRelativePositionFromTypeIndex(ytext, range.anchor)
        const focus = Y.createRelativePositionFromTypeIndex(ytext, range.focus)
        return { anchor, focus }
      }
      return nativeRangeToRelativeRange(awarenessField, range)
    }

    this._remoteCursors = createRemoteCursors(this.conf.awareness, {
      awarenessField: CODEBLOCK_AWARENESS_FIELD,
    })
  }

  destroy() {}

  /**
   * @param {cmView.ViewUpdate} update
   */
  update(update: cmView.ViewUpdate) {
    const hasFocus = update.view.hasFocus && update.view.dom.ownerDocument.hasFocus()
    const sel = hasFocus ? update.state.selection.main : null
    this._remoteCursors.sendLocalRange(sel ? {
      anchor: sel.anchor,
      focus: sel.head,
    }: null)
  }
}

export const yRemoteSelections = cmView.ViewPlugin.fromClass(YRemoteSelectionsPluginValue)
