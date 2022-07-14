import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames';
import { EditableEditor } from '@editablejs/editor';
import ToolbarGroup from './group';
import { ButtonProps, GroupItem, ToolbarItem, DropdownProps } from './types';
import './style.less'

export interface ToolbarProps {
  editor: EditableEditor
  items: ToolbarItem[][]
  renderButton?: (editor: EditableEditor, item: ButtonProps) => JSX.Element
}

const Toolbar: React.FC<ToolbarProps & React.HTMLAttributes<HTMLDivElement>> = ({ editor, items: itemProps, renderButton, className, ...props }) => {

  const setActiveState = useCallback((items: ToolbarItem[][]): GroupItem[][] => { 
    return items.map(group => group.map(item => {
      switch(item.type) { 
        case 'button':
          return { ...item, active: item.onActive ? item.onActive(editor) : false }
        case 'dropdown':
          return { ...item, activeKey: item.onActive ? item.onActive(editor) : '' }
      }
      return item
    }))
  },[editor])

  const [ items, setItems ] = useState<GroupItem[][]>(setActiveState(itemProps))

  useEffect(() => {
    const { onSelectionChange } = editor
    editor.onSelectionChange = () => {
      onSelectionChange()
      setItems(items => {
        return setActiveState(items)
      })
    }
  }, [editor, setActiveState])

  return <div className={classNames('editable-toolbar', className)} {...props}>
  {
    items.map((group, index) => 
    <ToolbarGroup 
    key={index} 
    editor={editor} 
    items={group} 
    />)
  }
  </div>
}

export default Toolbar
export type {
  ToolbarItem,
  GroupItem,
  ButtonProps,
  DropdownProps
}
