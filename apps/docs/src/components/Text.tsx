import type { IText, NodeData, RenderOptions } from "@editablejs/core"
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import useComponent from "../hooks/component"
import NodeComponent from "./Node"

const TextComponent: React.FC<RenderOptions<NodeData, IText>> = (props) => {
  const { editor } = props
  const { node } = useComponent(props)
  const key = node.getKey()
  const text = node.getText()

  // composition chars
  const [ chars, setChars ] = useState<Record<'type' | 'text', string>[]>()
  // composition element
  const compositionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    editor.onCompositionUpdate(key, (data) => {
      setChars(data?.chars)
    })
    return () => editor.offCompositionUpdate(key)
  }, [key, editor])

  useLayoutEffect(() => {
    const textNode = compositionRef.current?.firstChild as Text
    if(chars && textNode) editor.didCompositionUpdate(textNode)
  }, [chars, editor])

  const renderText = () => {
    if (!chars) return text
    return chars.map(char => { 
      if (char.type === 'composition') { 
        return <u ref={compositionRef} key={char.type}>{char.text}</u>
      }
      return char.text
    })
  }
  const noneText = node.isEmpty() && !chars
  if(noneText) return <NodeComponent node={node} style={node.getFormat()} dangerouslySetInnerHTML={{__html: '&#xFEFF'}}/>
  return <NodeComponent node={node} style={node.getFormat()}>{ renderText() }</NodeComponent>
}

export const renderText = (options: RenderOptions<NodeData, IText>) => {
  const { node } = options
  return <TextComponent key={node.getKey()} {...options}/>
};

export default TextComponent