import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames';
import { Editable } from '@editablejs/editor';
import ToolbarGroup, { GroupItem } from './group';
import { ToolbarButton } from './button';
import { ToolbarDropdown } from './dropdown';
import './style.less'

export type ToolbarItem = ToolbarButton | ToolbarDropdown
export interface ToolbarProps {
  editor: Editable
  items: ToolbarItem[][]
}

const Toolbar: React.FC<ToolbarProps & React.HTMLAttributes<HTMLDivElement>> = ({ editor, items: itemProps, className, ...props }) => {

  const setActiveState = useCallback((items: ToolbarItem[][]): GroupItem[][] => { 
    return items.map(group => group.map(item => {
      switch(item.type) { 
        case 'button':
          return { ...item, active: item.onActive ? item.onActive(editor) : false }
        case 'dropdown':
          return { ...item, activeKey: item.onActive ? item.onActive(editor) : '' }
      }
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
