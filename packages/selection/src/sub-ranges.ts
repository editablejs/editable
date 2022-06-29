import { ElementInterface, ModelInterface, Text, Element } from "@editablejs/model"
import Range, { RangeInterface } from "./range"

/**
* 按节点拆分子范围
* @param ranges 
* @returns 
*/
export const getSubRanges = (model: ModelInterface, ...ranges: RangeInterface[]): RangeInterface[] => { 
 const subRanges: RangeInterface[] = []
 for(let i = 0; i < ranges.length; i++) {
   const range = ranges[i]
   // anchor 和 focus 同一个节点
   if(range.isCollapsed) {
     subRanges.push(range)
     continue
   }
   const { anchor, focus, isBackward } = range
   const startKey = isBackward ? focus.key : anchor.key
   const startOffset = isBackward ? focus.offset : anchor.offset
   // 开始节点
   const start = model.getNode(startKey)
   // 结束节点
   const endKey = isBackward ? anchor.key : focus.key
   const endOffset = isBackward ? anchor.offset : focus.offset
   const end = model.getNode(endKey)
   if(!start || !end) continue
   let parentKey = start.getParentKey()
   if(!parentKey) continue;
   let parent = model.getNode<ElementInterface>(parentKey)
   if(Text.isText(start)) {
     // as same
     if(startKey === endKey) {
       subRanges.push(range)
       continue
     }
     subRanges.push(new Range(startKey, startOffset, startKey, start.getText().length))
   }
   let next = model.getNext(startKey)
   let finded = false
 
   while(parent) {
     while(next) {
       const nextKey = next.getKey()
       if((Text.isText(next) && nextKey !== endKey) || (Element.isElement(next) && !next.contains(endKey))) {
         const offset = parent.indexOf(nextKey)
         if(~~offset) continue
         subRanges.push(new Range(parentKey, offset, parentKey, offset + 1))
       }
       else if(Text.isText(next)) {
         subRanges.push(new Range(endKey, 0, endKey, endOffset))
         finded = true
         break
       } else if(Element.isElement(next)) {
         const findChildRange = (node: ElementInterface) => {
           const children = node.getChildren()
           for(let i = 0; i < children.length; i++) {
             const child = children[i]
             const childKey = child.getKey()
             if(childKey === endKey) {
               subRanges.push(new Range(childKey, 0, childKey, endOffset))
               break
             } else if(Element.isElement(child) && child.contains(endKey)) { 
               findChildRange(child)
               break
             }
             subRanges.push(new Range(childKey, i, childKey, i + 1))
           }
         }
         findChildRange(next)
         finded = true
         break
       }
       next = model.getNext(next.getKey())
     }
     if(finded) break
     next = model.getNext(parentKey)
     parentKey = parent.getParentKey()
     if(!parentKey) break
     parent = model.getNode<ElementInterface>(parentKey)
   }
 }
 return subRanges
}