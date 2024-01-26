import { HTMLDeserializerWithTransform } from '@editablejs/deserializer/html'
import { Descendant, isDOMHTMLElement } from '@editablejs/models'
import { TABLE_CELL_KEY } from '../constants'

export const withTableCellHTMLDeserializerTransform: HTMLDeserializerWithTransform = (
  next,
  deserializer,
) => {
  return (node, options = {}) => {
    const { text } = options
    if (isDOMHTMLElement(node) && ['TD', 'TH'].includes(node.nodeName)) {
      const children: Descendant[] = []
      for (const child of node.childNodes) {
        const content = deserializer.transform(child, {
          text,
          matchNewline: true,
        })
        children.push(...content)
      }
      if (children.length === 0) {
        children.push({ children: [{ text: '' }] })
      }
      const { colSpan, rowSpan } = node as HTMLTableCellElement
      // 遍历children，每个子元素再次放入到children中
      let ifHiddenCell = false;
      const spanArray = [];
      children.forEach(child => {
        if (child.children === undefined) {
          if (child.text.indexOf('displaynone||||||') > -1) {
            ifHiddenCell = true;
            const startRow = child.text.split('||||||')[1];
            const startCol = child.text.split('||||||')[2];
            spanArray.push(startRow - 0);
            spanArray.push(startCol - 0);
          }
          const tempChild = [{...child}];
          //把child的所有属性移除
          Object.keys(child).forEach(key => delete child[key]);
          child.children = tempChild;
        }
      });

      const cell = ifHiddenCell ? {
        type: TABLE_CELL_KEY,
        children,
        span: spanArray,
      } : {
        type: TABLE_CELL_KEY,
        children,
        colspan: colSpan,
        rowspan: rowSpan,
      }
      return [cell]
    }
    return next(node, options)
  }
}
