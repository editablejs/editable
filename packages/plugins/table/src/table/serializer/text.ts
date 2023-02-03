import { TextSerializerWithTransform } from '@editablejs/serializer/text'
import { Table } from '../interfaces/table'

export const withTableTextSerializerTransform: TextSerializerWithTransform = (next, serializer) => {
  return node => {
    if (Table.isTable(node)) {
      return node.children.map(child => serializer.transform(child)).join('\n')
    }
    return next(node)
  }
}
