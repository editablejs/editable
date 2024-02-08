import {
  Toolbar as UIToolbar,
  ToolbarProps as UIToolbarProps,
  ToolbarButton as UIToolbarButton,
  ToolbarDropdown as UIToolbarDropdown,
  ToolbarColorPicker as UIToolbarColorPicker,
  ToolbarSeparator,
  ColorPickerLocale,
} from '@editablejs/theme'
import {
  ToolbarButtonItem,
  ToolbarColorPickerItem,
  ToolbarDropdownItem,
  ToolbarItem,
} from '../types'
import { c, useCallback, useMemo } from 'rezon'
import { repeat } from 'rezon/directives/repeat'

export const ToolbarButton = c<ToolbarButtonItem>(({ type, ...props }) => {
  return UIToolbarButton(props)
}, (prev, next) => (
  prev.active === next.active &&
  prev.disabled === next.disabled &&
  prev.onToggle === next.onToggle &&
  prev.children === next.children &&
  prev.title === next.title
))


export const ToolbarDropdown = c<ToolbarDropdownItem>(({ type, ...props }) => {
  return UIToolbarDropdown(props)
}, (prev, next) => {
  return (
    prev.disabled === next.disabled &&
    prev.value === next.value &&
    prev.onSelect === next.onSelect &&
    prev.children === next.children &&
    prev.items.length === next.items.length
  )
})


export const ToolbarColorPicker = c<
  ToolbarColorPickerItem & {
    locale?: Record<'colorPicker', ColorPickerLocale>
  }>(({ type, locale, ...props }) => UIToolbarColorPicker({ locale: locale?.colorPicker, ...props })

    , (prev, next) => {
      return (
        prev.disabled === next.disabled &&
        prev.value === next.value &&
        prev.onSelect === next.onSelect &&
        prev.colors === next.colors
      )
    })

export interface ToolbarProps extends UIToolbarProps {
  items: ToolbarItem[]
  locale?: Record<'colorPicker', ColorPickerLocale>
  disabled?: boolean
  onRenderItem?: (
    item: ToolbarItem,
    defaultRenderItem: (item: ToolbarItem, index: number) => unknown,
  ) => unknown
}

export const Toolbar = c<ToolbarProps>(({
  className,
  locale,
  items,
  disabled,
  onRenderItem,
  ...props
}) => {
  const defaultRenderItem = useCallback(
    (item: ToolbarItem) => {
      if (item === 'separator') return ToolbarSeparator({})
      if ('content' in item) return item.content
      const { type } = item
      switch (type) {
        case 'button':
          return ToolbarButton(item)
        case 'dropdown':
          return ToolbarDropdown(item)
        case 'color-picker':
          return ToolbarColorPicker({ locale, ...item })
      }
    },
    [locale],
  )

  const renderItem = useMemo(() => {
    if (onRenderItem) {
      return (item: ToolbarItem) => {
        return onRenderItem(item, defaultRenderItem)
      }
    }
    return defaultRenderItem
  }, [onRenderItem, defaultRenderItem])
  return UIToolbar({
    className, ...props, children: repeat(items ?? [], (_, index) => index, item => {
      if (disabled && typeof item === 'object' && !('content' in item)) {
        item.disabled = true
      }
      return renderItem(item)
    })
  })
})

