import { Transforms, List } from '@editablejs/models'
import { ALIGN_ATTR_KEY } from './constants'
import { Align, AlignValue } from './interfaces/align'
import { AlignHotkey, AlignOptions } from './options'

const { wrapList, unwrapList, splitList } = List

List.wrapList = (editor, entry, options = {}) => {
  const { props } = options

  wrapList(editor, entry, {
    ...options,
    props(key, node, path) {
      const p = props ? props(key, node, path) : {}
      if (Align.isAlign(node)) {
        const textAlign = node[ALIGN_ATTR_KEY]
        Transforms.setNodes<Align>(
          editor,
          { [ALIGN_ATTR_KEY]: AlignValue.Left },
          {
            at: path,
          },
        )
        return {
          ...p,
          textAlign,
        }
      }
      return p
    },
  })
}

List.unwrapList = (editor, options = {}) => {
  const { props } = options

  unwrapList(editor, {
    ...options,
    props(list, path) {
      const p = props ? props(list, path) : {}
      if (Align.isAlign(list)) {
        const textAlign = list[ALIGN_ATTR_KEY]
        return {
          ...p,
          textAlign,
        }
      }
      return p
    },
  })
}

List.splitList = (editor, options = {}) => {
  const { props } = options

  splitList(editor, {
    ...options,
    props(list, path) {
      const p = props ? props(list, path) : {}
      if (Align.isAlign(list)) {
        const textAlign = list[ALIGN_ATTR_KEY]
        return {
          ...p,
          textAlign,
        }
      }
      return p
    },
  })
}

export type { AlignOptions, AlignHotkey }

export * from './interfaces/align'

export * from './plugin/align-editor'

export * from './plugin/with-align'
