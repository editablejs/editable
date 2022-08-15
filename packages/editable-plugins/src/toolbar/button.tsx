
import { Editable } from '@editablejs/editor';
import classNames from 'classnames'
import React from 'react';

interface ButtonProps { 
  editor: Editable
  onToggle: <T extends Editable>(editor: T) => void;
  active?: boolean
  disabled?: boolean
  children: any
}

export interface ToolbarButton extends Omit<ButtonProps, 'active' | 'editor'> {
  onActive?: <T extends Editable>(editor: T) => boolean
  type: 'button'
} 

const Button: React.FC<ButtonProps> =({ editor, children, onToggle, active, disabled }) => {

	const handleMouseDown = (event: React.MouseEvent) => {
		event.preventDefault()
		onToggle(editor)
	}

  return <button onMouseDown={handleMouseDown} className={classNames("toolbar-btn", {"toolbar-btn-active": active, "toolbar-btn-disabled": disabled})}>{ children }</button>
}

export default Button