import { useEditableStatic, useIsomorphicLayoutEffect } from '@editablejs/editor'
import { Toolbar as ToolbarComponent, useToolbarEffect, useToolbarItems } from '@editablejs/plugins'
import { createToolbarConfig } from '../configs/toolbar'

export const Toolbar = () => {
  const editor = useEditableStatic()
  useToolbarEffect(createToolbarConfig, editor)

  useIsomorphicLayoutEffect(() => {
    createToolbarConfig(editor)
  }, [editor])

  const items = useToolbarItems(editor)
  return <ToolbarComponent items={items} />
}
