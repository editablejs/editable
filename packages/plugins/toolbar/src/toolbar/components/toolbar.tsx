import { Editable, useLocale, useReadOnly } from '@editablejs/editor'
import { useToolbarItems } from '../store'
import { Toolbar, ToolbarProps } from '../../components/toolbar'
import { ToolbarLocale } from '../../locale'

export interface ToolbarComponentProps extends Omit<ToolbarProps, 'items' | 'locale'> {
  editor: Editable
  items?: ToolbarProps['items']
}

export const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  editor,
  items: itemsProp,
  ...props
}) => {
  const items = useToolbarItems(editor)

  const locale = useLocale<ToolbarLocale>('toolbar')

  return <Toolbar locale={locale} items={itemsProp || items} {...props} />
}
