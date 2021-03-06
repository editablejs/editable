
import { EditableEditor } from '@editablejs/editor';
import classNames from 'classnames'
import React, { forwardRef } from 'react';

interface ButtonProps { 
  editor: EditableEditor
  onToggle: <T extends EditableEditor>(editor: T) => void;
  active?: boolean
  disabled?: boolean
  children: any
}

export interface ToolbarButton extends Omit<ButtonProps, 'active' | 'editor'> {
  onActive?: <T extends EditableEditor>(editor: T) => boolean
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