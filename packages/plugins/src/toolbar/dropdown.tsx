import React from 'react';
import { Editable } from '@editablejs/editor';
import { Dropdown } from '@editablejs/ui'
import type { DropdownProps  } from '@editablejs/ui'

export interface DropdownItem {
	key: string;
	content?: React.ReactNode | (<T extends Editable>(editor: T) => React.ReactChild)
	className?: string;
	disabled?: boolean;
}

interface ToolbarDropdownProps extends Omit<DropdownProps, 'onSelect'> { 
	editor: Editable;
  onToggle: <T extends Editable>(editor: T, item: DropdownItem) => void;
  onActive?: <T extends Editable>(editor: T) => string;
}

export interface ToolbarDropdown extends Omit<ToolbarDropdownProps, 'activeKey' | 'editor'> { 
	type: 'dropdown'
}

export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = ({ editor, onToggle, ...props }) => {

	const toggleSelect = (item: DropdownItem) => {
		onToggle(editor, item)
	}

  return <Dropdown onSelect={toggleSelect} {...props} />
}