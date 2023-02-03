import { Editor, Operation, PathRef, PointRef, RangeRef } from '@editablejs/models'
import * as Y from 'yjs'
import { UniqueOperations } from '../constants'
import { YjsEditor } from '../plugin'
import { translateYTextEvent } from './text-event'

/**
 * Traneditor a yjs event into editor operations. The editor state has to match the
 * yText state before the event occurred.
 *
 * @param sharedType
 * @param op
 */
export function translateYjsEvent(
  sharedRoot: Y.XmlText,
  editor: Editor,
  event: Y.YEvent<Y.XmlText>,
): Operation[] {
  if (event instanceof Y.YTextEvent) {
    return translateYTextEvent(sharedRoot, editor, event)
  }

  throw new Error('Unexpected Y event type')
}

const FLUSH_OPS = new WeakSet<Operation>()

const { transform: transformPathRef } = PathRef
PathRef.transform = (ref, op) => {
  if (FLUSH_OPS.has(op)) {
    return
  }
  transformPathRef(ref, op)
}

const { transform: transformPointRef } = PointRef
PointRef.transform = (ref, op) => {
  if (FLUSH_OPS.has(op)) {
    return ref
  }
  transformPointRef(ref, op)
}

const { transform: transformRangeRef } = RangeRef
RangeRef.transform = (ref, op) => {
  if (FLUSH_OPS.has(op)) {
    return
  }
  return transformRangeRef(ref, op)
}

/**
 * Traneditors yjs events into editor operations and applies them to the editor. The
 * editor state has to match the yText state before the events occurred.
 *
 * @param sharedRoot
 * @param editor
 * @param events
 */
export function applyYjsEvents(
  sharedRoot: Y.XmlText,
  editor: YjsEditor,
  events: Y.YEvent<Y.XmlText>[],
) {
  Editor.withoutNormalizing(editor, () => {
    const origin: any = YjsEditor.origin(editor)
    const originOps: Operation[] = origin?.meta?.ops ?? []
    // yjs中未存在的操作，会成为组的发过来。这里需要对 ref 执行更新，否则yjs的原子op会导致ref的错误
    const originOp = originOps[0]
    if (originOp && ~UniqueOperations.indexOf(originOp.type)) {
      originOps.forEach(op => {
        for (const ref of Editor.pathRefs(editor)) {
          PathRef.transform(ref, op)
        }

        for (const ref of Editor.pointRefs(editor)) {
          PointRef.transform(ref, op)
        }

        for (const ref of Editor.rangeRefs(editor)) {
          RangeRef.transform(ref, op)
        }
      })
    }
    const ops = events.reduceRight<Operation[]>((ops, event) => {
      return [...ops, ...translateYjsEvent(sharedRoot, editor, event)]
    }, [])

    ops.forEach(op => {
      FLUSH_OPS.add(op)
      editor.apply(op)
      FLUSH_OPS.delete(op)
    })
  })
}
