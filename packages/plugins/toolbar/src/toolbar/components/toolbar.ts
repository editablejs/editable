import { Editable, useLocale } from '@editablejs/editor'
import { useToolbarItems } from '../store'
import { Toolbar, ToolbarProps } from '../../components/toolbar'
import { ToolbarLocale } from '../../locale'
import { c } from 'rezon'

export interface ToolbarComponentProps extends Omit<ToolbarProps, 'items' | 'locale'> {
  editor: Editable
  items?: ToolbarProps['items']
}

export const ToolbarComponent = c<ToolbarComponentProps>(({
  editor,
  items: itemsProp,
  ...props
}) => {
  const items = useToolbarItems(editor)

  const locale = useLocale<ToolbarLocale>(editor, 'toolbar')

  return Toolbar({
    locale,
    items: itemsProp || items,
    ...props,
  })
})
