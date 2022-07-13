import { EditableEditor } from "@editablejs/editor";

export interface ToolbarItem {
  onActive?: <T extends EditableEditor>(editor: T) => boolean;
  onToggle: <T extends EditableEditor>(editor: T) => void;
  children: any
}

export interface ButtonProps extends ToolbarItem { 
  active: boolean
}

export type GroupItem = ButtonProps