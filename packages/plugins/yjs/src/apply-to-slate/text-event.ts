import { Editor, Element, Node, Operation, Path, Text } from '@editablejs/editor'
import {
  deepEquals,
  deltaInsertToSlateNode,
  getProperties,
  omitNullEntries,
  pick,
} from '@editablejs/plugin-yjs-transform'
import * as Y from 'yjs'
import { Delta } from '../types'
import { getSlateNodeYLength, getSlatePath, yOffsetToSlateOffsets } from '../utils/location'

function applyDelta(node: Element, slatePath: Path, delta: Delta): Operation[] {
  const ops: Operation[] = []

  let yOffset = delta.reduce((length, change) => {
    if ('retain' in change) {
      return length + change.retain
    }

    if ('delete' in change) {
      return length + change.delete
    }

    return length
  }, 0)

  // Apply changes in reverse order to avoid path changes.
  delta.reverse().forEach(change => {
    if ('attributes' in change && 'retain' in change) {
      const [startPathOffset, startTextOffset] = yOffsetToSlateOffsets(
        node,
        yOffset - change.retain,
      )
      const [endPathOffset, endTextOffset] = yOffsetToSlateOffsets(node, yOffset, { assoc: -1 })

      for (let pathOffset = endPathOffset; pathOffset >= startPathOffset; pathOffset--) {
        const child = node.children[pathOffset]
        const childPath = [...slatePath, pathOffset]

        const newProperties = change.attributes
        const properties = pick(node, ...(Object.keys(change.attributes) as Array<keyof Element>))

        if (
          Text.isText(child) &&
          (pathOffset === startPathOffset || pathOffset === endPathOffset)
        ) {
          const start = pathOffset === startPathOffset ? startTextOffset : 0
          const end = pathOffset === endPathOffset ? endTextOffset : child.text.length

          if (end !== child.text.length) {
            ops.push({
              type: 'split_node',
              path: childPath,
              position: end,
              properties: getProperties(child),
            })
          }

          if (start !== 0) {
            ops.push({
              type: 'split_node',
              path: childPath,
              position: start,
              properties: omitNullEntries({
                ...getProperties(child),
                ...newProperties,
              }),
            })

            continue
          }
        }

        ops.push({
          type: 'set_node',
          newProperties,
          path: childPath,
          properties,
        })
      }
    }

    if ('retain' in change) {
      yOffset -= change.retain
    }

    if ('delete' in change) {
      const [startPathOffset, startTextOffset] = yOffsetToSlateOffsets(
        node,
        yOffset - change.delete,
      )
      const [endPathOffset, endTextOffset] = yOffsetToSlateOffsets(node, yOffset, { assoc: -1 })

      for (
        let pathOffset = endTextOffset === 0 ? endPathOffset - 1 : endPathOffset;
        pathOffset >= startPathOffset;
        pathOffset--
      ) {
        const child = node.children[pathOffset]
        const childPath = [...slatePath, pathOffset]

        if (
          Text.isText(child) &&
          (pathOffset === startPathOffset || pathOffset === endPathOffset)
        ) {
          const start = pathOffset === startPathOffset ? startTextOffset : 0
          const end = pathOffset === endPathOffset ? endTextOffset : child.text.length

          ops.push({
            type: 'remove_text',
            offset: start,
            text: child.text.slice(start, end),
            path: childPath,
          })

          yOffset -= end - start
          continue
        }

        ops.push({
          type: 'remove_node',
          node: child,
          path: childPath,
        })
        yOffset -= getSlateNodeYLength(child)
      }

      return
    }

    if ('insert' in change) {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(node, yOffset, {
        insert: true,
      })
      const child = node.children[pathOffset]
      const childPath = [...slatePath, pathOffset]

      if (Text.isText(child)) {
        if (
          typeof change.insert === 'string' &&
          deepEquals(change.attributes ?? {}, getProperties(child))
        ) {
          return ops.push({
            type: 'insert_text',
            offset: textOffset,
            text: change.insert,
            path: childPath,
          })
        }

        const toInsert = deltaInsertToSlateNode(change)
        if (textOffset === 0) {
          return ops.push({
            type: 'insert_node',
            path: childPath,
            node: toInsert,
          })
        }

        if (textOffset < child.text.length) {
          ops.push({
            type: 'split_node',
            path: childPath,
            position: textOffset,
            properties: getProperties(child),
          })
        }

        return ops.push({
          type: 'insert_node',
          path: Path.next(childPath),
          node: toInsert,
        })
      }

      return ops.push({
        type: 'insert_node',
        path: childPath,
        node: deltaInsertToSlateNode(change),
      })
    }
  })

  return ops
}

export function translateYTextEvent(
  sharedRoot: Y.XmlText,
  editor: Editor,
  event: Y.YTextEvent,
): Operation[] {
  const { target, changes } = event
  const delta = event.delta as Delta

  if (!(target instanceof Y.XmlText)) {
    throw new Error('Unexpected target node type')
  }

  const ops: Operation[] = []
  const slatePath = getSlatePath(sharedRoot, editor, target)
  const targetElement = Node.get(editor, slatePath)

  if (Text.isText(targetElement)) {
    throw new Error('Cannot apply yTextEvent to text node')
  }

  const keyChanges = Array.from(changes.keys.entries())
  if (slatePath.length > 0 && keyChanges.length > 0) {
    const newProperties = Object.fromEntries(
      keyChanges.map(([key, info]) => [
        key,
        info.action === 'delete' ? null : target.getAttribute(key),
      ]),
    )

    const properties = Object.fromEntries(
      keyChanges.map(([key]) => [key, (targetElement as any)[key]]),
    )

    ops.push({ type: 'set_node', newProperties, properties, path: slatePath })
  }

  if (delta.length > 0) {
    if (Text.isText(targetElement)) {
      throw new Error('Cannot apply delta to slate text')
    }

    ops.push(...applyDelta(targetElement, slatePath, delta))
  }

  return ops
}
