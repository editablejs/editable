import {
  ToolbarButtonProps,
  ToolbarDropdownProps,
  ColorPickerProps,
} from '@editablejs/theme'

export interface ToolbarButtonItem extends ToolbarButtonProps {
  type: 'button'
}

export interface ToolbarDropdownItem extends ToolbarDropdownProps {
  type: 'dropdown'
}

export interface ToolbarColorPickerItem extends Omit<ColorPickerProps, 'side' | 'locale'> {
  type: 'color-picker'
}

export interface ToolbarCustomItem {
  content: unknown
}

export type ToolbarItem =
  | ToolbarButtonItem
  | ToolbarDropdownItem
  | ToolbarColorPickerItem
  | ToolbarCustomItem
  | 'separator'
