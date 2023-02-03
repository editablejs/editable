import { Transforms, List } from '@editablejs/models'
import { LEADING_ATTR_KEY } from './constants'
import { Leading } from './interfaces/leading'
import { LeadingHotkey, LeadingOptions } from './options'

const { wrapList, unwrapList, splitList } = List

List.wrapList = (editor, entry, options = {}) => {
  const { props } = options

  wrapList(editor, entry, {
    ...options,
    props(key, node, path) {
      const p = props ? props(key, node, path) : {}
      if (Leading.isLeading(node)) {
        const lineHeight = node[LEADING_ATTR_KEY]
        Transforms.setNodes<Leading>(
          editor,
          { [LEADING_ATTR_KEY]: undefined },
          {
            at: path,
          },
        )
        return {
          ...p,
          lineHeight,
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
      if (Leading.isLeading(list)) {
        const lineHeight = list[LEADING_ATTR_KEY]
        return {
          ...p,
          lineHeight,
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
      if (Leading.isLeading(list)) {
        const lineHeight = list[LEADING_ATTR_KEY]
        return {
          ...p,
          lineHeight,
        }
      }
      return p
    },
  })
}

export type { LeadingOptions, LeadingHotkey }

export * from './interfaces/leading'

export * from './plugin/leading-editor'

export * from './plugin/with-leading'
