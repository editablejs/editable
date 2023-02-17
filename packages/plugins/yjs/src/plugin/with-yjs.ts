import { Descendant, Editor, Operation, Point } from '@editablejs/models'
import { Editable } from '@editablejs/editor'
import {
  assertDocumentAttachment,
  editorPointToRelativePosition,
  getStoredPosition,
  getStoredPositions,
  relativePositionToEditorPoint,
  removeStoredPosition,
  setStoredPosition,
  yTextToEditorElement,
} from '@editablejs/yjs-transform'

import { withProviderProtocol } from '@editablejs/protocols/provider'
import * as Y from 'yjs'
import { applyYjsEvents } from '../apply-to-editor'
import { applyEditorOp } from '../apply-to-yjs'
import { UniqueOperations } from '../constants'

type LocalChange = {
  op: Operation
  doc: Descendant[]
  origin: unknown
}

const DEFAULT_LOCAL_ORIGIN = Symbol('editable-yjs-operation')
const DEFAULT_POSITION_STORAGE_ORIGIN = Symbol('editable-yjs-position-storage')

const ORIGIN: WeakMap<Editor, unknown> = new WeakMap()
const LOCAL_CHANGES: WeakMap<Editor, LocalChange[]> = new WeakMap()

export type YjsEditor = Editor & {
  sharedRoot: Y.XmlText
  undoManager: Y.UndoManager
  localOrigin: unknown
  positionStorageOrigin: unknown

  applyRemoteEvents: (events: Y.YEvent<Y.XmlText>[], origin: unknown) => void

  storeLocalChange: (op: Operation) => void
  flushLocalChanges: () => void

  isLocalOrigin: (origin: unknown) => boolean
}

export const YjsEditor = {
  isYjsEditor(value: unknown): value is YjsEditor {
    return (
      Editor.isEditor(value) &&
      (value as YjsEditor).sharedRoot instanceof Y.XmlText &&
      'localOrigin' in value &&
      'positionStorageOrigin' in value &&
      typeof (value as YjsEditor).applyRemoteEvents === 'function' &&
      typeof (value as YjsEditor).storeLocalChange === 'function' &&
      typeof (value as YjsEditor).flushLocalChanges === 'function' &&
      typeof (value as YjsEditor).isLocalOrigin === 'function'
    )
  },

  localChanges(editor: YjsEditor): LocalChange[] {
    return LOCAL_CHANGES.get(editor) ?? []
  },

  applyRemoteEvents(editor: YjsEditor, events: Y.YEvent<Y.XmlText>[], origin: unknown): void {
    editor.applyRemoteEvents(events, origin)
  },

  storeLocalChange(editor: YjsEditor, op: Operation): void {
    editor.storeLocalChange(op)
  },

  flushLocalChanges(editor: YjsEditor): void {
    editor.flushLocalChanges()
  },

  connected(editor: YjsEditor): boolean {
    return withProviderProtocol(editor).connected()
  },

  connect(editor: YjsEditor): void {
    withProviderProtocol(editor).connect()
  },

  disconnect(editor: YjsEditor): void {
    withProviderProtocol(editor).disconnect()
  },

  isLocal(editor: YjsEditor): boolean {
    return editor.isLocalOrigin(YjsEditor.origin(editor))
  },

  origin(editor: YjsEditor): unknown {
    const origin = ORIGIN.get(editor)
    return origin !== undefined ? origin : editor.localOrigin
  },

  withOrigin(editor: YjsEditor, origin: unknown, fn: () => void): void {
    const prev = YjsEditor.origin(editor)
    ORIGIN.set(editor, origin)
    fn()
    ORIGIN.set(editor, prev)
  },

  storePosition(editor: YjsEditor, key: string, point: Point): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor
    assertDocumentAttachment(sharedRoot)

    const position = editorPointToRelativePosition(sharedRoot, editor, point)

    sharedRoot.doc.transact(() => {
      setStoredPosition(sharedRoot, key, position)
    }, locationStorageOrigin)
  },

  removeStoredPosition(editor: YjsEditor, key: string): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor
    assertDocumentAttachment(sharedRoot)

    sharedRoot.doc.transact(() => {
      removeStoredPosition(sharedRoot, key)
    }, locationStorageOrigin)
  },

  position(editor: YjsEditor, key: string): Point | null | undefined {
    const position = getStoredPosition(editor.sharedRoot, key)
    if (!position) {
      return undefined
    }

    return relativePositionToEditorPoint(editor.sharedRoot, editor, position)
  },

  storedPositionsRelative(editor: YjsEditor): Record<string, Y.RelativePosition> {
    return getStoredPositions(editor.sharedRoot)
  },
}

export type WithYjsOptions = {
  autoConnect?: boolean

  // Origin used when applying local editor operations to yjs
  localOrigin?: unknown

  // Origin used when storing positions
  positionStorageOrigin?: unknown
}

export function withYjs<T extends Editor>(
  editor: T,
  sharedRoot: Y.XmlText,
  { localOrigin, positionStorageOrigin, autoConnect = false }: WithYjsOptions = {},
): T & YjsEditor {
  const e = editor as T & YjsEditor

  e.sharedRoot = sharedRoot

  e.localOrigin = localOrigin ?? DEFAULT_LOCAL_ORIGIN
  e.positionStorageOrigin = positionStorageOrigin ?? DEFAULT_POSITION_STORAGE_ORIGIN

  e.applyRemoteEvents = (events, origin) => {
    YjsEditor.flushLocalChanges(e)

    Editor.withoutNormalizing(e, () => {
      YjsEditor.withOrigin(e, origin, () => {
        applyYjsEvents(e.sharedRoot, e, events)
      })
    })
  }

  e.isLocalOrigin = origin => origin === e.localOrigin

  const handleYEvents = (events: Y.YEvent<Y.XmlText>[], transaction: Y.Transaction) => {
    if (e.isLocalOrigin(transaction.origin)) {
      return
    }

    YjsEditor.applyRemoteEvents(e, events, transaction.origin)
  }

  let autoConnectTimeoutId: ReturnType<typeof setTimeout> | null = null
  if (autoConnect) {
    autoConnectTimeoutId = setTimeout(() => {
      autoConnectTimeoutId = null
      YjsEditor.connect(e)
    })
  }

  const providerProtocol = withProviderProtocol(e)
  const { connect, disconnect } = providerProtocol
  providerProtocol.connect = () => {
    e.sharedRoot.observeDeep(handleYEvents)
    const content = yTextToEditorElement(e.sharedRoot)

    editor.selection = null
    editor.children = content.children

    // Editor.normalize(editor, { force: true })
    if (!editor.operations.length) {
      editor.onChange()
    }

    connect()
  }

  providerProtocol.disconnect = () => {
    if (autoConnectTimeoutId) {
      clearTimeout(autoConnectTimeoutId)
    }

    YjsEditor.flushLocalChanges(e)
    if (providerProtocol.connected()) e.sharedRoot.unobserveDeep(handleYEvents)

    disconnect()
  }

  e.storeLocalChange = op => {
    LOCAL_CHANGES.set(e, [
      ...YjsEditor.localChanges(e),
      { op, doc: editor.children, origin: YjsEditor.origin(e) },
    ])
  }

  e.flushLocalChanges = () => {
    assertDocumentAttachment(e.sharedRoot)
    const localChanges = YjsEditor.localChanges(e)
    LOCAL_CHANGES.delete(e)

    // Group local changes by origin so we can apply them in the correct order
    // with the correct origin with a minimal amount of transactions.
    const txGroups: LocalChange[][] = []
    localChanges.forEach(change => {
      const currentGroup = txGroups[txGroups.length - 1]
      if (
        currentGroup &&
        // If the current group contains a unique operation, we can't group
        (~~UniqueOperations.indexOf(change.op.type) ||
          ~UniqueOperations.indexOf(currentGroup[0].op.type)) &&
        currentGroup[0].origin === change.origin
      ) {
        return currentGroup.push(change)
      }

      txGroups.push([change])
    })

    txGroups.forEach(txGroup => {
      assertDocumentAttachment(e.sharedRoot)

      e.sharedRoot.doc.transact(t => {
        txGroup.forEach(change => {
          assertDocumentAttachment(e.sharedRoot)
          // 设置 origin ops 到 meta 中，在 applyRemoteEvents 中，可以使用 origin.meta.ops 来获取操作。前提需要使用 @editablejs/yjs-websocket 插件
          const ops = t.meta.get('ops')
          if (!ops) {
            t.meta.set('ops', [{ ...change.op }])
          } else {
            ops.push({ ...change.op })
          }
          applyEditorOp(e.sharedRoot, { children: change.doc }, change.op)
        })
      }, txGroup[0].origin)
    })
  }

  const { apply, onChange } = e
  e.apply = op => {
    if (YjsEditor.connected(e) && YjsEditor.isLocal(e) && !Editable.isComposing(e)) {
      YjsEditor.storeLocalChange(e, op)
    }

    apply(op)
  }

  e.onChange = () => {
    if (YjsEditor.connected(e) && !Editable.isComposing(e)) {
      YjsEditor.flushLocalChanges(e)
    }

    onChange()
  }

  return e
}
