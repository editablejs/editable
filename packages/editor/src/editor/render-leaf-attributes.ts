import { Editor, Text } from "@/interfaces"
import { TextAttributes } from "./render-leaf"

export interface RenderLeafAttributes<T extends Text = Text> {
  text: T
  attributes: TextAttributes
}

export const renderLeafAttributes = (editor: Editor, props: RenderLeafAttributes) => {
  const { attributes } = props
  return attributes
}
