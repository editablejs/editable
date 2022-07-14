import { EditableEditor } from "@editablejs/editor";

export interface ButtonProps { 
  onToggle: <T extends EditableEditor>(editor: T) => void;
  onActive?: <T extends EditableEditor>(editor: T) => boolean
  type: 'button'
  active: boolean
  children: any
}

export type ToolbarButton = Omit<ButtonProps, 'active'>

export type DropdownItem = Record<string, string>
export interface DropdownProps { 
  type: 'dropdown'
  activeKey: string
  onToggle: <T extends EditableEditor>(editor: T, key: keyof DropdownItem) => void;
  onActive?: <T extends EditableEditor>(editor: T) => keyof DropdownItem;
  items: DropdownItem
}

export type ToolbarDropdown = Omit<DropdownProps, 'activeKey'>

export type GroupItem = ButtonProps | DropdownProps

export type ToolbarItem = ToolbarButton | ToolbarDropdown