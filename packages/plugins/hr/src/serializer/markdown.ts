import { MarkdownSerializerWithTransform } from '@editablejs/serializer/markdown'
import { Hr } from '../interfaces/hr'

export const withHrMarkdownSerializerTransform: MarkdownSerializerWithTransform = next => {
  return (node, options = {}) => {
    if (Hr.isHr(node)) {
      return [
        {
          type: 'thematicBreak',
        },
      ]
    }
    return next(node, options)
  }
}
