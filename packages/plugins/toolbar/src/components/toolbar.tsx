import * as React from 'react'
import {
  Toolbar as UIToolbar,
  ToolbarButton as UIToolbarButton,
  ToolbarDropdown as UIToolbarDropdown,
  ToolbarColorPicker as UIToolbarColorPicker,
  ToolbarSeparator,
  ColorPickerLocale,
} from '@editablejs/ui'
import {
  ToolbarButtonItem,
  ToolbarColorPickerItem,
  ToolbarDropdownItem,
  ToolbarItem,
} from '../types'

export const ToolbarButtonDefault: React.FC<ToolbarButtonItem> = ({ type, ...props }) => {
  return <UIToolbarButton {...props} />
}

export const ToolbarButton = React.memo(ToolbarButtonDefault, (prev, next) => {
  return (
    prev.active === next.active &&
    prev.disabled === next.disabled &&
    prev.onToggle === next.onToggle &&
    prev.children === next.children &&
    prev.title === next.title
  )
})

export const ToolbarDropdownDefault: React.FC<ToolbarDropdownItem> = ({ type, ...props }) => {
  return <UIToolbarDropdown {...props} />
}

export const ToolbarDropdown = React.memo(ToolbarDropdownDefault, (prev, next) => {
  return (
    prev.disabled === next.disabled &&
    prev.value === next.value &&
    prev.onSelect === next.onSelect &&
    prev.children === next.children &&
    prev.items.length === next.items.length
  )
})

export const ToolbarColorPickerDefault: React.FC<
  ToolbarColorPickerItem & {
    locale?: Record<'colorPicker', ColorPickerLocale>
  }
> = ({ type, locale, children, ...props }) => {
  return (
    <UIToolbarColorPicker locale={locale?.colorPicker} {...props}>
      {children}
    </UIToolbarColorPicker>
  )
}

export const ToolbarColorPicker = React.memo(ToolbarColorPickerDefault, (prev, next) => {
  return (
    prev.disabled === next.disabled &&
    prev.value === next.value &&
    prev.onSelect === next.onSelect &&
    prev.colors === next.colors
  )
})
export interface ToolbarProps extends UIToolbar {
  items: ToolbarItem[]
  locale?: Record<'colorPicker', ColorPickerLocale>
  disabled?: boolean
  onRenderItem?: (
    item: ToolbarItem,
    index: number,
    defaultRenderItem: (item: ToolbarItem, index: number) => React.ReactNode,
  ) => React.ReactNode
}

export const Toolbar: React.FC<ToolbarProps> = ({
  className,
  locale,
  items,
  disabled,
  onRenderItem,
  ...props
}) => {
  const defaultRenderItem = React.useCallback(
    (item: ToolbarItem, index: number) => {
      if (item === 'separator') return <ToolbarSeparator key={index} />
      if ('content' in item) return React.cloneElement(item.content, { key: index })
      const { type } = item
      switch (type) {
        case 'button':
          return <ToolbarButton key={index} {...item} />
        case 'dropdown':
          return <ToolbarDropdown key={index} {...item} />
        case 'color-picker':
          return <ToolbarColorPicker locale={locale} key={index} {...item} />
      }
    },
    [locale],
  )

  const renderItem = React.useMemo(() => {
    if (onRenderItem) {
      return (item: ToolbarItem, index: number) => {
        return onRenderItem(item, index, defaultRenderItem)
      }
    }
    return defaultRenderItem
  }, [onRenderItem, defaultRenderItem])

  return (
    <UIToolbar className={className} {...props}>
      {(items ?? []).map((item, index) => {
        if (disabled && typeof item === 'object' && !('content' in item)) {
          item.disabled = true
        }
        return renderItem(item, index)
      })}
    </UIToolbar>
  )
}
