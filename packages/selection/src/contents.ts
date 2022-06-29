import { ElementInterface, ModelInterface, NodeInterface, Text, Element } from "@editablejs/model"
import { RangeInterface } from "./range"
import { getSubRanges } from "./sub-ranges"

export const getContents = (model: ModelInterface, ...ranges: RangeInterface[]): NodeInterface[] => {
  const subRanges = getSubRanges(model, ...ranges)
  let parentElement: ElementInterface | null = null
  for(let i = 0; i < subRanges.length; i++) { 
    const range = subRanges[i]
    const anchorNode = model.getNode(range.anchor.key)
    if(!anchorNode) continue
    const parentKey = anchorNode.getParentKey()
    if(!parentKey) continue
    if(!parentElement || !parentElement.contains(parentKey)) {
      const parent: ElementInterface | null = model.getNode<ElementInterface>(parentKey)
      if(parentElement && Text.isText(anchorNode) && parent?.getType() === parentElement.getType()) {
        const pKey: string | null = parentElement.getParentKey()
        parentElement = pKey ? model.getNode<ElementInterface>(pKey) : null
      } else {
        parentElement = parent
      }
    }
  }
  const contents: NodeInterface[] = []
  const parentMap = new Map<string, ElementInterface>()
  for(let s = 0; s < subRanges.length; s++) { 
    const range = subRanges[s]
    const { anchor, focus } = range
    const anchorNode = model.getNode(range.anchor.key)
    if(!anchorNode) continue
    let isAdd: boolean | undefined = undefined
    const warpParent = (child: NodeInterface) => {
      let parentKey = child.getParentKey()
      while(parentKey) {
        let parentClone = parentMap.get(parentKey)
        if(isAdd === undefined) isAdd = !parentClone
        if(!parentClone) {
          const parent = model.getNode<ElementInterface>(parentKey)
          if(!parent || parentElement?.getType() === parent.getType()) return isAdd ? child : null
          parentClone = parent.clone()
          parentMap.set(parentKey, parentClone)
        } else if(parentClone.hasChild(child.getKey())) { 
          return null
        }
        parentClone.appendChild(child)
        child = parentClone
        parentKey = parentClone.getParentKey()
      }
      return child
    }
    if(Text.isText(anchorNode)) {
      const text = anchorNode.getText()
      anchorNode.setText(text.substring(anchor.offset, focus.offset))
      const newNode = warpParent(anchorNode)
      if(newNode) contents.push(newNode)
    } else if(Element.isElement(anchorNode)) {
      const children = anchorNode.getChildren()
      const newNode = warpParent(children[anchor.offset >= children.length ? children.length - 1 : anchor.offset])
      if(newNode) contents.push(newNode)
    }
  }
  return contents
}