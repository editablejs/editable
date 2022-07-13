
import { EditableEditor } from '@editablejs/editor';
import classNames from 'classnames'
import React from 'react';
import { GroupItem } from './types';

const Button: React.FC<GroupItem & Record<'editor', EditableEditor>> = ({ editor, children, onToggle, active }) => {

	const handleMouseDown = (event: React.MouseEvent) => {
		event.preventDefault()
		onToggle(editor)
	}

  return <button onMouseDown={handleMouseDown} className={classNames("toolbar-btn", {"active": active})}>{ children }</button>
}

export default Button