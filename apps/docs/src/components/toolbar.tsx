import * as React from 'react'
import { useEditableStatic } from '@editablejs/editor'
import {
  Toolbar as ToolbarComponent,
  ToolbarStore,
  useToolbarEffect,
  useToolbarItems,
} from '@editablejs/plugins'
import { createToolbarItems } from '../configs/toolbar-items'

export const Toolbar: React.FC = props => {
  const editor = useEditableStatic()
  useToolbarEffect(() => {
    ToolbarStore.setToolbarItems(editor, createToolbarItems(editor))
  }, editor)

  const items = useToolbarItems(editor)
  return <ToolbarComponent {...props} items={items} />
}
