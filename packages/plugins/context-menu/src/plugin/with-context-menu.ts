import { Editable, Slot } from '@editablejs/editor'
import { ContextMenuPortal } from '../components/context-menu-portal'
import { ContextMenuOptions, setOptions } from '../options'
import { ContextMenuEditor } from './context-menu-editor'

export const withContextMenu = <T extends Editable>(
  editor: T,
  options: ContextMenuOptions = {},
) => {
  const newEditor = editor as T & ContextMenuEditor

  setOptions(newEditor, options)

  Slot.mount(editor, ContextMenuPortal)
  newEditor.on('destory', () => {
    Slot.unmount(editor, ContextMenuPortal)
  })
  return newEditor
}
