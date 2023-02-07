import * as cmView from '@codemirror/view'
import * as Y from 'yjs'
import { Awareness } from '@editablejs/yjs-protocols/awareness'
import {
  AwarenessSelection,
  AwarenessRelativeSelection,
  withAwarenessSelection,
} from '@editablejs/yjs-protocols/awareness-selection'
import { YSyncConfig, ySyncFacet } from './sync'
import { CODEBLOCK_AWARENESS_FIELD, CODEBLOCK_AWARENESS_ID } from '../../constants'
import { Editor } from '@editablejs/models'
import { Editable } from '@editablejs/editor'
import { CodeBlock } from '../../interfaces/codeblock'

interface CodeBlockAwarenessSelection {
  [CODEBLOCK_AWARENESS_ID]: string
}

const isCodeBlockAwarenessSelection = (value: any): value is CodeBlockAwarenessSelection => {
  return typeof value === 'object' && value[CODEBLOCK_AWARENESS_ID] !== undefined
}

export class YRemoteSelectionsPluginValue {
  conf: YSyncConfig
  _awareness: Awareness
  _awarenessSelection: AwarenessSelection
  constructor(view: cmView.EditorView) {
    this.conf = view.state.facet(ySyncFacet)

    this._awareness = this.conf.awareness

    const awarenessSelection = withAwarenessSelection(this._awareness, CODEBLOCK_AWARENESS_FIELD)
    const { relativeSelectionToNativeSelection, nativeSelectionToRelativeSelection } =
      awarenessSelection

    awarenessSelection.relativeSelectionToNativeSelection = (
      selection: AwarenessRelativeSelection,
      clientID,
    ) => {
      if (
        isCodeBlockAwarenessSelection(selection) &&
        selection[CODEBLOCK_AWARENESS_ID] === this.conf.id
      ) {
        const ytext = this.conf.ytext
        const editor = this.conf.editor
        const ydoc = ytext.doc
        if (!ydoc) return null
        const anchor = Y.createAbsolutePositionFromRelativePosition(selection.anchor, ydoc)
        const head = Y.createAbsolutePositionFromRelativePosition(selection.focus, ydoc)
        if (anchor == null || head == null || anchor.type !== ytext || head.type !== ytext) {
          return null
        }
        const editorSelection = {
          anchor: anchor.index,
          focus: head.index,
          [CODEBLOCK_AWARENESS_ID]: selection[CODEBLOCK_AWARENESS_ID],
        }
        if (!editorSelection) return null
        return {
          isBackward: () => editorSelection.anchor > editorSelection.focus,
          isCollapsed: () => editorSelection.anchor === editorSelection.focus,
          toRects() {
            const anchor = view.domAtPos(editorSelection.anchor)
            const focus = view.domAtPos(editorSelection.focus)
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
          ...editorSelection,
        }
      }
      return relativeSelectionToNativeSelection(selection, clientID)
    }

    awarenessSelection.nativeSelectionToRelativeSelection = (
      selection: Record<'anchor' | 'focus', number>,
      clientID,
    ) => {
      if (
        isCodeBlockAwarenessSelection(selection) &&
        selection[CODEBLOCK_AWARENESS_ID] === this.conf.id
      ) {
        const ytext = this.conf.ytext
        const anchor = Y.createRelativePositionFromTypeIndex(ytext, selection.anchor)
        const focus = Y.createRelativePositionFromTypeIndex(ytext, selection.focus)
        return { anchor, focus, [CODEBLOCK_AWARENESS_ID]: selection[CODEBLOCK_AWARENESS_ID] }
      }
      return nativeSelectionToRelativeSelection(selection, clientID)
    }

    this._awarenessSelection = awarenessSelection
  }

  destroy() {}

  /**
   * @param {cmView.ViewUpdate} update
   */
  update(update: cmView.ViewUpdate) {
    const hasFocus = update.view.hasFocus && update.view.dom.ownerDocument.hasFocus()
    const sel = hasFocus ? update.state.selection.main : null

    if (
      !sel &&
      Editor.above(this.conf.editor, {
        match: node => CodeBlock.isCodeBlock(node),
      })
    )
      return null
    this._awarenessSelection.sendSelection(
      sel
        ? {
            anchor: sel.anchor,
            focus: sel.head,
            [CODEBLOCK_AWARENESS_ID]: this.conf.id,
          }
        : null,
    )
  }
}

export const yRemoteSelections = cmView.ViewPlugin.fromClass(YRemoteSelectionsPluginValue)
