import { EditableInterface, ElementInterface, ElementOptions, createNode, NodeInterface, Text, TextInterface, Element } from "@editablejs/core"
import React, { useLayoutEffect } from "react"
import { EditableContext } from '../hooks/use-editable-static';
import ElementComponent from "./Element";
import TextComponent from "./Text";

export interface EditorProps {
  editable: EditableInterface
  value?: ElementInterface[]
  initialValue?: ElementOptions
  onChange?: (value: ElementInterface[]) => void
  renderText?: (node: TextInterface) => React.ReactNode
  renderElement?: (node: ElementInterface) => React.ReactNode
}

const EditorComponent: React.FC<EditorProps> = ({ editable, value, initialValue, onChange, renderText, renderElement }) => {
  useLayoutEffect(() => {
    const { getModel } = editable
    const model = getModel()
    editable.onChange = () => {
      const roots = model.getRoots()
      if(onChange) onChange(roots)
    }
    if(initialValue) model.insertNode(createNode(initialValue))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable])

  const render = (children: NodeInterface[]) => {
    return children.map(element => {
      if(Text.isText(element)) return renderText ? renderText(element) : <TextComponent key={element.getKey()} node={element} />
      if(Element.isElement(element)) return renderElement ? renderElement(element) : <ElementComponent key={element.getKey()} node={element}>{ render(element.getChildren()) }</ElementComponent>
      return null
    })
  }

  return (
    <EditableContext.Provider value={editable}>
      {
        render(value ?? [])
      }
    </EditableContext.Provider>
  )
}

export default EditorComponent