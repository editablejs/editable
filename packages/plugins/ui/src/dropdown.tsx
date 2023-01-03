import * as React from 'react'
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
  content?: React.ReactNode
  disabled?: boolean
}

type DropdownSize = 'small' | 'default' | 'large'

export interface Dropdown extends Menu {
  size?: DropdownSize
  value?: string
  defaultValue?: string
  defaultActiveFirstItem?: boolean
  className?: string
  disabled?: boolean
  items: DropdownItem[]
  onValueChange?: (value: string) => void
}

type DropdownItem = DropdownItemProps | 'separator'

const sizeCls = (size: DropdownSize = 'default') => [
  tw`py-1`,
  size === 'small' && tw`py-0.5 pr-1 pl-3`,
  size === 'large' && tw`py-2 pr-3 pl-9`,
]

export const Dropdown = React.forwardRef<HTMLButtonElement, Dropdown>(
  (
    {
      children,
      disabled,
      items,
      defaultActiveFirstItem = true,
      className,
      onValueChange,
      defaultValue: defaultValueProps,
      value: valueProps,
      size = 'default',
      ...props
    },
    ref,
  ) => {
    const defaultValue = React.useMemo(() => {
      if (defaultValueProps) return defaultValueProps
      const firstItem = items.find(item => item !== 'separator')
      return defaultActiveFirstItem && typeof firstItem === 'object' ? firstItem.value : ''
    }, [defaultActiveFirstItem, items, defaultValueProps])

    const [value, setValue] = React.useState(defaultValue)

    const handleSelect = (e: Event, v: string) => {
      setValue(v)
      if (onValueChange) onValueChange(value)
      setOpen(false)
    }

    React.useEffect(() => {
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
              css={[
                tw`relative flex cursor-pointer items-center py-1 pl-6 pr-2 hover:bg-gray-100`,
                sizeCls(size),
              ]}
              onSelect={e => handleSelect(e, value)}
              onMouseDown={e => e.preventDefault()}
              {...props}
            >
              <MenuItemIndicator
                css={[
                  tw`absolute left-2 top-0 flex items-center h-full text-gray-400`,
                  size === 'small' && tw`left-1`,
                  size === 'large' && tw`left-3`,
                ]}
              >
                <Icon name="check" />
              </MenuItemIndicator>
              {content ?? value}
            </MenuRadioItem>
          )
        }
      })
    }

    const { open: openProp, onOpenChange, dir, ...triggerProps } = props

    const [open, setOpen] = React.useState(openProp)

    const activeItem = React.useMemo(() => {
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
              tw`inline-flex cursor-pointer text-base content-center items-center gap-2 rounded border-none bg-white px-1 outline-none hover:bg-gray-100`,
              className,
              size === 'small' && tw`text-sm px-0.5 gap-1`,
              size === 'large' && tw`text-lg px-1.5 gap-3`,
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
            ref={ref}
          >
            {children ?? activeItem?.content ?? value}
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
            css={[
              tw`overflow-hidden rounded border text-base border-solid border-gray-200 bg-white shadow-md z-50`,
              size === 'small' && tw`text-sm`,
              size === 'large' && tw`text-lg`,
            ]}
          >
            <MenuRadioGroup value={value} onValueChange={onValueChange}>
              {renderItems(items)}
            </MenuRadioGroup>
          </MenuContent>
        </Portal>
      </Menu>
    )
  },
)
Dropdown.displayName = 'Dropdown'
