import * as React from 'react'
import {
  ToolbarButton as UIToolbarButton,
  ToolbarDropdown as UIToolbarDropdown,
  ToolbarColorPicker as UIToolbarColorPicker,
} from '@editablejs/ui'

export interface ToolbarButtonItem extends UIToolbarButton {
  type: 'button'
}

export interface ToolbarDropdownItem extends UIToolbarDropdown {
  type: 'dropdown'
}

export interface ToolbarColorPickerItem extends Omit<UIToolbarColorPicker, 'side' | 'locale'> {
  type: 'color-picker'
}

export interface ToolbarCustomItem {
  content: React.ReactElement
}

export type ToolbarItem =
  | ToolbarButtonItem
  | ToolbarDropdownItem
  | ToolbarColorPickerItem
  | ToolbarCustomItem
  | 'separator'
