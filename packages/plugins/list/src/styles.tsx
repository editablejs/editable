import { Editable, RenderElementProps } from '@editablejs/editor'
import { List, ListTemplate } from '@editablejs/models'
import { StyledComponent } from 'styled-components'
import tw, { styled } from 'twin.macro'

export interface RenderListOptions {
  props: RenderElementProps<List>
  StyledList?: StyledComponent<'div', any>
  onRenderLabel?: (element: List, template?: ListTemplate) => React.ReactNode
}

export const renderList = (editor: Editable, options: RenderListOptions) => {
  const {
    props: { element, attributes, children },
    StyledList,
    onRenderLabel,
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
    >
      {children}
    </ListElement>
  )
}

export const ListStyles = styled.div(() => [
  tw`w-full flex align-baseline items-baseline justify-start`,
])
export const ListLabelStyles = styled.span(() => [tw`inline-block mr-3 whitespace-nowrap`])
export const ListContentsStyles = styled.div``

export const ListElement = ({
  element,
  attributes,
  children,
  onRenderLabel,
  StyledList,
}: RenderElementProps<List> & {
  onRenderLabel: (element: List) => React.ReactNode
  StyledList?: StyledComponent<'div', any>
}) => {
  const { level } = element
  const StyledComponent = StyledList ?? ListStyles
  return (
    <StyledComponent data-list-level={level} {...attributes}>
      <ListLabelStyles>{onRenderLabel(element)}</ListLabelStyles>
      <ListContentsStyles>{children}</ListContentsStyles>
    </StyledComponent>
  )
}
