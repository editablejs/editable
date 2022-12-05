import { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import tw from 'twin.macro'
import { Icon } from './icon'
import {
  MenuAnchor,
  MenuContent,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  Menu,
  MenuSeparator,
  MenuItem,
} from './menu'
import { Portal } from './portal'

export interface DropdownItemProps extends Omit<MenuItem, 'onSelect' | 'textValue'> {
  value: string
  content?: ReactNode
  disabled?: boolean
}

export interface Dropdown extends Menu {
  value?: string
  defaultValue?: string
  defaultActiveFirstItem?: boolean
  className?: string
  disabled?: boolean
  items: DropdownItem[]
  onValueChange?: (value: string) => void
}

type DropdownItem = DropdownItemProps | 'separator'

export const Dropdown: FC<Dropdown> = ({
  children,
  disabled,
  items,
  defaultActiveFirstItem = true,
  className,
  onValueChange,
  defaultValue: defaultValueProps,
  value: valueProps,
  ...props
}) => {
  const defaultValue = useMemo(() => {
    if (defaultValueProps) return defaultValueProps
    const firstItem = items.find(item => item !== 'separator')
    return defaultActiveFirstItem && typeof firstItem === 'object' ? firstItem.value : ''
  }, [defaultActiveFirstItem, items, defaultValueProps])

  const [value, setValue] = useState(defaultValue)

  const handleSelect = (e: Event, v: string) => {
    setValue(v)
    if (onValueChange) onValueChange(value)
    setOpen(false)
  }

  useEffect(() => {
    setValue(valueProps ?? defaultValue)
  }, [defaultValue, valueProps])

  const renderItems = (items: DropdownItem[]) => {
    return items.map((item, index) => {
      if (item === 'separator') {
        return <MenuSeparator key={index} />
      } else {
        const { value, content, disabled, ...props } = item
        return (
          <MenuRadioItem
            disabled={disabled}
            key={value}
            value={value}
            tw="relative flex cursor-pointer items-center py-2 pl-9 pr-3 text-center hover:bg-gray-100"
            onSelect={e => handleSelect(e, value)}
            onMouseDown={e => e.preventDefault()}
            {...props}
          >
            <MenuItemIndicator tw="absolute left-3 top-0 my-2 text-gray-400">
              <Icon name="check" />
            </MenuItemIndicator>
            {content ?? value}
          </MenuRadioItem>
        )
      }
    })
  }

  const { open: openProp, onOpenChange, dir, ...triggerProps } = props

  const [open, setOpen] = useState(openProp)

  const activeItem = useMemo(() => {
    const findItem = (items: DropdownItem[]): DropdownItemProps | null => {
      for (const item of items) {
        if (item !== 'separator' && item.value === value) return item
      }
      return null
    }
    return findItem(items)
  }, [items, value])

  return (
    <Menu open={open} onOpenChange={onOpenChange} dir={dir}>
      <MenuAnchor>
        <button
          disabled={disabled}
          css={[
            tw`inline-flex cursor-pointer content-center items-center gap-2 rounded border-none bg-white px-1 outline-none hover:bg-gray-100`,
            className,
          ]}
          {...triggerProps}
          onPointerDown={event => {
            if (!disabled && event.button === 0 && event.ctrlKey === false) {
              setOpen(!open)
              event.preventDefault()
            }
          }}
          onKeyDown={event => {
            if (disabled) return
            if (['Enter', ' '].includes(event.key)) setOpen(!open)
            if (event.key === 'ArrowDown') setOpen(true)
            // prevent keydown from scrolling window / first focused item to execute
            // that keydown (inadvertently closing the menu)
            if (['Enter', ' ', 'ArrowDown'].includes(event.key)) event.preventDefault()
          }}
        >
          {children ?? activeItem?.children ?? value}
          <Icon
            name="arrowCaretDown"
            css={[tw`text-xs text-gray-400`, open && tw`rotate-180 mt-1`]}
          />
        </button>
      </MenuAnchor>
      <Portal>
        <MenuContent
          align="start"
          sideOffset={1}
          onEscapeKeyDown={() => setOpen(false)}
          onPointerDownOutside={() => setOpen(false)}
          tw="absolute overflow-hidden rounded border border-solid border-gray-200 bg-white shadow-md z-50"
        >
          <MenuRadioGroup value={value} onValueChange={onValueChange}>
            {renderItems(items)}
          </MenuRadioGroup>
        </MenuContent>
      </Portal>
    </Menu>
  )
}
