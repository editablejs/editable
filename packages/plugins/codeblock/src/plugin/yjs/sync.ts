import * as Y from 'yjs'
import * as cmState from '@codemirror/state'
import * as cmView from '@codemirror/view'
import { Awareness } from '@editablejs/yjs-protocols/awareness'
import { createYRange, YRange } from './range'
import { Editable } from '@editablejs/editor'

export class YSyncConfig {
  ytext: Y.Text
  awareness: Awareness
  editor: Editable
  id: string
  constructor(id: string, ytext: Y.Text, awareness: Awareness, editor: Editable) {
    this.id = id
    this.ytext = ytext
    this.awareness = awareness
    this.editor = editor
  }

  /**
   * Helper function to transform an absolute index position to a Yjs-based relative position
   * (https://docs.yjs.dev/api/relative-positions).
   *
   * A relative position can be transformed back to an absolute position even after the document has changed. The position is
   * automatically adapted. This does not require any position transformations. Relative positions are computed based on
   * the internal Yjs document model. Peers that share content through Yjs are guaranteed that their positions will always
   * synced up when using relatve positions.
   *
   * ```js
   * import { ySyncFacet } from 'y-codemirror'
   *
   * ..
   * const ysync = view.state.facet(ySyncFacet)
   * // transform an absolute index position to a ypos
   * const ypos = ysync.getYPos(3)
   * // transform the ypos back to an absolute position
   * ysync.fromYPos(ypos) // => 3
   * ```
   *
   * It cannot be guaranteed that absolute index positions can be synced up between peers.
   * This might lead to undesired behavior when implementing features that require that all peers see the
   * same marked range (e.g. a comment plugin).
   *
   * @param pos
   * @param [assoc]
   */
  toYPos(pos: number, assoc = 0) {
    return Y.createRelativePositionFromTypeIndex(this.ytext, pos, assoc)
  }

  /**
   * @param rpos
   */
  fromYPos(rpos: Y.RelativePosition | Object) {
    if (!this.ytext.doc) throw new Error('Document not attached')
    const pos = Y.createAbsolutePositionFromRelativePosition(
      Y.createRelativePositionFromJSON(rpos),
      this.ytext.doc,
    )
    if (pos == null || pos.type !== this.ytext) {
      throw new Error(
        '[yCodeblockPlugins]] The position you want to retrieve was created by a different document',
      )
    }
    return {
      pos: pos.index,
      assoc: pos.assoc,
    }
  }

  /**
   * @param range
   */
  toYRange(range: cmState.SelectionRange) {
    const assoc = range.assoc
    const yanchor = this.toYPos(range.anchor, assoc)
    const yhead = this.toYPos(range.head, assoc)
    return createYRange(yanchor, yhead)
  }

  /**
   * @param yrange
   */
  fromYRange(yrange: YRange) {
    const anchor = this.fromYPos(yrange.yanchor)
    const head = this.fromYPos(yrange.yhead)
    if (anchor.pos === head.pos) {
      return cmState.EditorSelection.cursor(head.pos, head.assoc)
    }
    return cmState.EditorSelection.range(anchor.pos, head.pos)
  }
}

export const ySyncFacet = cmState.Facet.define<YSyncConfig, YSyncConfig>({
  combine(inputs) {
    return inputs[inputs.length - 1]
  },
})

export const ySyncAnnotation = cmState.Annotation.define<YSyncConfig>()

class YSyncPluginValue implements cmView.PluginValue {
  view: cmView.EditorView
  conf: YSyncConfig
  private _ytext: Y.Text
  private _observer: (event: Y.YTextEvent, tr: Y.Transaction) => void
  constructor(view: cmView.EditorView) {
    this.view = view
    this.conf = view.state.facet(ySyncFacet)
    const applyYjsUpdate = (delta: Y.YTextEvent['delta']) => {
      const changes: cmState.ChangeSpec[] = []
      let pos = 0
      for (let i = 0; i < delta.length; i++) {
        const d = delta[i]
        if (d.insert != null) {
          changes.push({ from: pos, to: pos, insert: d.insert as string })
        } else if (d.delete != null) {
          changes.push({ from: pos, to: pos + d.delete, insert: '' })
          pos += d.delete
        } else if (d.retain != null) {
          pos += d.retain
        }
      }
      view.dispatch({ changes, annotations: [ySyncAnnotation.of(this.conf)] })
    }
    this._observer = (event, tr) => {
      if (tr.origin !== this.conf) {
        applyYjsUpdate(event.delta)
      }
    }
    // observe the Y.Text type for changes
    this._ytext = this.conf.ytext
    this._ytext.observe(this._observer)
  }

  update(update: cmView.ViewUpdate) {
    if (
      !update.docChanged ||
      (update.transactions.length > 0 &&
        update.transactions[0].annotation(ySyncAnnotation) === this.conf)
    ) {
      return
    }
    const ytext = this.conf.ytext
    ytext.doc?.transact(() => {
      /**
       * This variable adjusts the fromA position to the current position in the Y.Text type.
       */
      let adj = 0
      update.changes.iterChanges((fromA, toA, fromB, toB, insert) => {
        const insertText = insert.sliceString(0, insert.length, '\n')
        if (fromA !== toA) {
          ytext.delete(fromA + adj, toA - fromA)
        }
        if (insertText.length > 0) {
          ytext.insert(fromA + adj, insertText)
        }
        adj += insertText.length - (toA - fromA)
      })
    }, this.conf)
  }

  destroy() {
    if (this._ytext._eH.l.length > 0) this._ytext.unobserve(this._observer)
  }
}

export const ySync = cmView.ViewPlugin.fromClass(YSyncPluginValue)
