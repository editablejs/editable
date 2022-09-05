import React from 'react';
import { Editable } from '@editablejs/editor';
import { Button, ButtonProps } from '@editablejs/ui'

interface ToolbarButtonProps extends ButtonProps { 
  editor: Editable
  onToggle: <T extends Editable>(editor: T) => void;
}

export interface ToolbarButton extends Omit<ToolbarButtonProps, 'active' | 'editor'> {
  onActive?: <T extends Editable>(editor: T) => boolean
  onDisabled?: <T extends Editable>(editor: T) => boolean
  type: 'button'
} 

export const ToolbarButton: React.FC<ToolbarButtonProps> =({ editor, children, onToggle, ...props }) => {

	const handleMouseDown = (event: React.MouseEvent) => {
		event.preventDefault()
		onToggle(editor)
	}

  return <Button onMouseDown={handleMouseDown} {...props}>{ children }</Button>
}