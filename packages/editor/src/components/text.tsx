import React, { useRef } from 'react'
import { Element, Text as SlateText } from 'slate'

import Leaf from './leaf'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { NODE_TO_ELEMENT, ELEMENT_TO_NODE, EDITOR_TO_KEY_TO_ELEMENT } from '../utils/weak-maps'
import { useEditableStatic } from '../hooks/use-editable'
import { Editable } from '../plugin/editable'
import { DATA_EDITABLE_NODE } from '../utils/constants'
import { useDecorates } from '../hooks/use-decorate'
import { Decorate } from '../plugin/decorate'
import { PlaceholderRender } from '../plugin/placeholder'
import { usePlaceholder } from '../hooks/use-placeholder'

interface Decoration {
  text: SlateText
  renders: Decorate['render'][]
}
/**
 * Text.
 */
const Text = (props: {
  isLast: boolean
  parent: Element
  text: SlateText
  renderPlaceholder?: PlaceholderRender
}) => {
  const { isLast, parent, text, renderPlaceholder } = props
  const editor = useEditableStatic()
  const ref = useRef<HTMLSpanElement>(null)
  const key = Editable.findKey(editor, text)
  const path = Editable.findPath(editor, text)
  const decorates = useDecorates([text, path])
  // 每段文字需要的装饰器
  const decorations: Decoration[] = []
  for (const { decorate, ranges } of decorates) {
    const leaves = SlateText.decorations(text, ranges)
    // 没有直接添加
    if (decorations.length === 0)
      decorations.push(...leaves.map(text => ({ text, renders: [decorate.render] })))
    else {
      // 循环装饰器对比已有的进行拆分组装
      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i]
        const decoration = decorations[i]
        // 当前装饰器分割的字符数组比已有的长，追加到后面
        if (!decoration) {
          decorations.push({ text: leaf, renders: [decorate.render] })
          continue
        }
        const leafLength = leaf.text.length
        const { text: decorationText, renders } = decoration
        const decorationLength = decorationText.text.length
        // 相同位置的字符相等，追加装饰器渲染函数
        if (leafLength === decorationLength) {
          decoration.renders.push(decorate.render)
        }
        // 当前字符比已有位置的少，在已有位置分割
        else if (leafLength < decorationLength) {
          decorations.splice(
            i,
            1,
            { text: leaf, renders: renders.concat(decorate.render) },
            {
              text: {
                ...decorationText,
                text: decorationText.text.slice(leafLength),
              },
              renders,
            },
          )
        }
        // 当前字符比已有位置的多，在已有位置追加装饰器渲染函数
        else if (leafLength > decorationLength) {
          renders.push(decorate.render)
          leaves.splice(
            i,
            1,
            {
              ...leaf,
              text: leaf.text.slice(0, decorationLength),
            },
            {
              ...leaf,
              text: leaf.text.slice(decorationLength),
            },
          )
        }
      }
    }
  }
  const currentRenderPlaceholder = usePlaceholder(text)

  const children =
    decorations.length === 0
      ? [
          <Leaf
            renderPlaceholder={renderPlaceholder ?? currentRenderPlaceholder}
            isLast={isLast}
            key={`${key.id}`}
            text={text}
            parent={parent}
          />,
        ]
      : []
  for (let i = 0; i < decorations.length; i++) {
    const { text, renders } = decorations[i]
    let content = (
      <Leaf
        renderPlaceholder={renderPlaceholder ?? currentRenderPlaceholder}
        isLast={isLast && i === decorations.length - 1}
        key={`${key.id}-${i}`}
        text={text}
        parent={parent}
      />
    )
    if (renders.length > 0) {
      content = decorates.reduceRight((children, { decorate, ranges }) => {
        return decorate.render({
          entry: [text, path],
          ranges,
          children,
        })
      }, content)
    }
    children.push(content)
  }
  // Update element-related weak maps with the DOM element ref.
  useIsomorphicLayoutEffect(() => {
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
    if (ref.current) {
      KEY_TO_ELEMENT?.set(key, ref.current)
      NODE_TO_ELEMENT.set(text, ref.current)
      ELEMENT_TO_NODE.set(ref.current, text)
    } else {
      KEY_TO_ELEMENT?.delete(key)
      NODE_TO_ELEMENT.delete(text)
    }
  })

  return (
    <span {...{ [DATA_EDITABLE_NODE]: 'text' }} ref={ref}>
      {children}
    </span>
  )
}

const MemoizedText = React.memo(Text, (prev, next) => {
  return (
    next.parent === prev.parent &&
    next.isLast === prev.isLast &&
    next.text === prev.text &&
    prev.renderPlaceholder === next.renderPlaceholder
  )
})

export default MemoizedText
