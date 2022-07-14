
import { EditableEditor } from '@editablejs/editor';
import React, { useMemo } from 'react';
import { DropdownProps } from './types';

const Dropdown: React.FC<DropdownProps & Record<'editor', EditableEditor>> = ({ editor, items, onToggle, activeKey }) => {

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault()
    console.log(event.target.value)
		onToggle(editor, event.target.value)
	}

  const options = useMemo(() => {
    const els = []
    for(const key in items) { 
      els.push(<option key={key} value={key}>{ items[key] }</option>)
    }
    return els
  }, [items])

  return (
    <select className="toolbar-dropdown" value={activeKey} onChange={handleChange}>
      {
        options
      }
    </select>
  )
}

export default Dropdown