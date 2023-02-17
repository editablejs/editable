import {
  DATA_EDITABLE_LEAF,
  Editable,
  RenderElementProps,
  useEditableStatic,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import { List, ListTemplate, Text, Element } from '@editablejs/models'
import React, { useState } from 'react'
import { StyledComponent } from 'styled-components'
import tw, { styled } from 'twin.macro'

export interface RenderListOptions {
  props: RenderElementProps<List>
  StyledList?: StyledComponent<'div', any>
  onRenderLabel?: (element: List, template?: ListTemplate) => React.ReactNode
  isAutoUpdateLabelStyle?: boolean
}

export const renderList = (editor: Editable, options: RenderListOptions) => {
  const {
    props: { element, attributes, children },
    StyledList,
    onRenderLabel,
    isAutoUpdateLabelStyle,
  } = options
  const renderLabel = () => {
    const { template: key = 'default', type, start } = element
    const template = key ? List.getTemplate(editor, type, key) : undefined
    if (onRenderLabel) return onRenderLabel(element, template)
    const result = template ? template.render(element) : `${start}.`
    return typeof result === 'object' ? result.text : result
  }

  return (
    <ListElement
      StyledList={StyledList}
      element={element}
      attributes={attributes}
      onRenderLabel={renderLabel}
      isAutoUpdateLabelStyle={isAutoUpdateLabelStyle}
    >
      {children}
    </ListElement>
  )
}

export const ListStyles = styled.div(() => [
  tw`w-full flex align-baseline items-baseline justify-start`,
])
export const ListLabelStyles = styled.span(() => [tw`inline-block mr-3 whitespace-nowrap`])
export const ListContentsStyles = tw.div`flex-1`

type FontStyle = Record<'size' | 'weight' | 'color', string>

export const ListElement = ({
  element,
  attributes,
  children,
  onRenderLabel,
  StyledList,
  isAutoUpdateLabelStyle = true,
}: RenderElementProps<List> & {
  onRenderLabel: (element: List) => React.ReactNode
  StyledList?: StyledComponent<'div', any>
  isAutoUpdateLabelStyle?: boolean
}) => {
  const { level } = element
  const StyledComponent = StyledList ?? ListStyles
  const editor = useEditableStatic()
  const [textStyle, setTextStyle] = useState<React.CSSProperties>({})

  useIsomorphicLayoutEffect(() => {
    if (!isAutoUpdateLabelStyle) return
    let font: FontStyle | null = null

    const compareStyle = (style: CSSStyleDeclaration) => {
      if (!font) {
        font = {
          size: style.fontSize,
          weight: style.fontWeight,
          color: style.color,
        }
      } else if (
        font.size !== style.fontSize ||
        font.weight !== style.fontWeight ||
        font.color !== style.color
      ) {
        font = null
        return false
      }
      return true
    }

    const traverse = (element: Element) => {
      for (const child of element.children) {
        if (Text.isText(child)) {
          const textDom = Editable.toDOMNode(editor, child)
          const leafs = textDom.querySelectorAll<HTMLElement>(`[${DATA_EDITABLE_LEAF}]`)
          for (const leaf of leafs) {
            if (!compareStyle(leaf.style)) return
          }
        } else {
          traverse(child)
        }
      }
    }
    traverse(element)
    if (font) {
      font = font as FontStyle
      setTextStyle({
        fontSize: font.size,
        fontWeight: font.weight,
        color: font.color,
      })
    }
  }, [editor, element, isAutoUpdateLabelStyle])

  return (
    <StyledComponent data-list-level={level} {...attributes}>
      <ListLabelStyles style={textStyle}>{onRenderLabel(element)}</ListLabelStyles>
      <ListContentsStyles>{children}</ListContentsStyles>
    </StyledComponent>
  )
}
