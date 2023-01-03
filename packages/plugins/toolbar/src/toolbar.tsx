import * as React from 'react'
import { Editable, useEditableStatic } from '@editablejs/editor'
import {
  Toolbar as UIToolbar,
  ToolbarButton as UIToolbarButton,
  ToolbarDropdown as UIToolbarDropdown,
  ToolbarSeparator,
} from '@editablejs/plugin-ui'
import { ToolbarButtonItem, ToolbarDropdownItem, ToolbarItem } from './store'

export const ToolbarButtonDefault: React.FC<ToolbarButtonItem> = ({ type, onToggle, ...props }) => {
  const editor = useEditableStatic()

  const handleToogle = () => {
    if (onToggle) onToggle(editor)
  }

  return <UIToolbarButton {...props} onToggle={handleToogle} />
}

export const ToolbarButton = React.memo(ToolbarButtonDefault, (prev, next) => {
  return (
    prev.active === next.active &&
    prev.disabled === next.disabled &&
    prev.onToggle === next.onToggle &&
    prev.children === next.children &&
    prev.title === next.title
  )
})

export const ToolbarDropdownDefault: React.FC<ToolbarDropdownItem> = ({
  type,
  onToggle,
  ...props
}) => {
  const editor = useEditableStatic()

  const handleToogle = (value: string) => {
    if (onToggle) onToggle(editor, value)
  }

  return <UIToolbarDropdown {...props} onToggle={handleToogle} />
}

export const ToolbarDropdown = React.memo(ToolbarDropdownDefault, (prev, next) => {
  return (
    prev.disabled === next.disabled &&
    prev.value === next.value &&
    prev.onToggle === next.onToggle &&
    prev.children === next.children &&
    prev.items.length === next.items.length
  )
})
export interface Toolbar extends UIToolbar {
  items: ToolbarItem[]
}

export const Toolbar: React.FC<Toolbar> = ({ className, items, ...props }) => {
  const renderItem = (item: ToolbarItem, key: any) => {
    if (item === 'separator') return <ToolbarSeparator key={key} />
    const { type } = item
    switch (type) {
      case 'button':
        return <ToolbarButton key={key} {...item} />
      case 'dropdown':
        return <ToolbarDropdown key={key} {...item} />
    }
  }
  return (
    <UIToolbar className={className} {...props}>
      {(items ?? []).map(renderItem)}
    </UIToolbar>
  )
}

export interface ToolbarOptions {}

export const TOOLBAR_OPTIONS = new WeakMap<Editable, ToolbarOptions>()

export interface ToolbarEditor extends Editable {}

export const ToolbarEditor = {
  getOptions: (editor: Editable): ToolbarOptions => {
    return TOOLBAR_OPTIONS.get(editor) ?? {}
  },
}

export const withToolbar = <T extends Editable>(editor: T, options: ToolbarOptions = {}) => {
  const newEditor = editor as T & ToolbarEditor

  TOOLBAR_OPTIONS.set(editor, options)

  return newEditor
}
