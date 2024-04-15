import { Editor, Node, Element } from "@/interfaces"
import { DATA_EDITABLE_COMPOSITION, DATA_EDITABLE_STRING, DATA_EDITABLE_ZERO_WIDTH } from "@/utils/constants"

export const findContentHostingElements = (editor: Editor, node: Node) => {
  const domNode = Editor.getDOMNode(editor, node)
  if (Element.isElement(node) && Editor.isVoid(editor, node)) return [domNode]
  const nodes = domNode.querySelectorAll(
    `[${DATA_EDITABLE_STRING}], [${DATA_EDITABLE_COMPOSITION}], [${DATA_EDITABLE_ZERO_WIDTH}]`,
  )
  return Array.from(nodes)
}
