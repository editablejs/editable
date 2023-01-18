import * as React from 'react'
import tw, { css, styled } from 'twin.macro'
import { composeRefs } from './compose-refs'
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

export interface SelectItemProps extends Omit<MenuItem, 'onSelect' | 'textValue'> {
  value: string
  content?: string
  disabled?: boolean
}

type SelectSize = 'small' | 'default' | 'large'

export interface Select extends Omit<Menu, 'children'> {
  size?: SelectSize
  value?: string
  defaultValue?: string
  placeholder?: string
  defaultActiveFirstItem?: boolean
  disabled?: boolean
  items: SelectItem[]
  onSelect?: (value: string) => void
  renderEmpty?: () => React.ReactNode
}

export type SelectItem = SelectItemProps | 'separator'

const sizeCls = (size: SelectSize = 'default') => [
  tw`py-2`,
  size === 'small' && tw`py-1 pr-2 pl-5`,
  size === 'large' && tw`py-3 pr-5 pl-12`,
]

const StyledInput = styled.input<{ size: SelectSize }>(({ size }) => [
  tw`px-1.5 bg-transparent text-base outline-0 absolute top-0 bottom-0 w-full`,
  size === 'small' && tw`px-0.5 gap-1`,
  size === 'large' && tw`px-2.5 gap-3`,
]) as React.FC<
  React.HTMLAttributes<HTMLInputElement> & {
    size: SelectSize
    value?: string
    type: React.HTMLInputTypeAttribute
    disabled?: boolean
    ref: React.Ref<HTMLInputElement>
  }
>

export const Select = React.forwardRef<HTMLInputElement, Select>(
  (
    {
      disabled,
      items,
      defaultActiveFirstItem = true,
      onSelect,
      defaultValue: defaultValueProps,
      value: valueProps,
      placeholder,
      size = 'default',
      renderEmpty,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const defaultValue = React.useMemo(() => {
      if (defaultValueProps) return defaultValueProps
      const firstItem = items.find(item => item !== 'separator')
      return defaultActiveFirstItem && typeof firstItem === 'object' ? firstItem.value : ''
    }, [defaultActiveFirstItem, items, defaultValueProps])

    const [filterItems, setFilterItems] = React.useState(items)
    const [value, setValue] = React.useState(defaultValue)

    const activeItem = React.useMemo(() => {
      const findItem = (items: SelectItem[]): SelectItemProps | null => {
        for (const item of items) {
          if (item !== 'separator' && item.value === value) return item
        }
        return null
      }
      return findItem(items)
    }, [items, value])

    const [search, setSearch] = React.useState('')

    React.useEffect(() => {
      setFilterItems(
        items.filter(
          item =>
            item === 'separator' || item.value.includes(search) || item.content?.includes(search),
        ),
      )
    }, [items, search])

    const handleSelect = (e: Event, v: string) => {
      setValue(v)
      setSearch('')
      if (onSelect) onSelect(value)
      setOpen(false)
    }

    React.useEffect(() => {
      setValue(valueProps ?? defaultValue)
    }, [defaultValue, valueProps])

    const renderItems = (items: SelectItem[]) => {
      return items.map((item, index) => {
        if (item === 'separator') {
          return <MenuSeparator key={index} />
        } else {
          const { value, disabled, content, ...props } = item
          return (
            <MenuRadioItem
              disabled={disabled}
              key={value}
              value={value}
              css={[
                tw`relative flex cursor-pointer items-center pl-9 pr-4 hover:bg-gray-100`,
                sizeCls(size),
              ]}
              onSelect={e => handleSelect(e, value)}
              onMouseDown={e => e.preventDefault()}
              {...props}
            >
              <MenuItemIndicator
                css={[
                  tw`absolute left-3 top-0 flex items-center h-full text-gray-400`,
                  size === 'small' && tw`left-2`,
                  size === 'large' && tw`left-4`,
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

    return (
      <Menu open={open} onOpenChange={onOpenChange} dir={dir}>
        <MenuAnchor>
          <span
            data-open={open || undefined}
            css={[
              tw`relative inline-flex items-center justify-between border border-gray-300 rounded hover:border-primary focus-within:border-primary`,
              css`
                &[data-open='true'] {
                  ${tw`bg-gray-100`}
                }
              `,
            ]}
            onPointerDown={event => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                if (event.target !== inputRef.current) {
                  event.preventDefault()
                  inputRef.current?.focus()
                }
                setOpen(!open)
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
            {...triggerProps}
          >
            <StyledInput
              type="text"
              size={size}
              value={search}
              onChange={event => {
                if (event.target instanceof HTMLInputElement) setSearch(event.target.value)
              }}
              disabled={disabled}
              placeholder={open && !activeItem?.value ? placeholder : undefined}
              ref={composeRefs(inputRef, ref)}
            />
            <span
              css={[
                tw`w-full px-1.5 relative inline-block select-none overflow-hidden whitespace-nowrap text-ellipsis cursor-text`,
                size === 'small' && tw`px-0.5`,
                size === 'large' && tw`px-2.5`,
                ((open && !search) || (!open && !value)) && tw`text-gray-400`,
                open && !!search && tw`text-transparent`,
              ]}
            >
              {activeItem?.content ?? activeItem?.value ?? placeholder}
            </span>
            <Icon
              name="arrowCaretDown"
              css={[
                tw`text-xxs text-gray-400 mr-2 ml-1 transition-all`,
                open && tw`rotate-180 mt-1`,
              ]}
            />
          </span>
        </MenuAnchor>
        <MenuContent
          align="start"
          sideOffset={1}
          onEscapeKeyDown={() => setOpen(false)}
          onPointerDownOutside={() => setOpen(false)}
          css={[
            tw`overflow-hidden text-base py-1 w-full rounded-md border border-zinc-200 bg-white shadow-md z-50`,
            size === 'small' && tw`text-sm`,
            size === 'large' && tw`text-lg`,
          ]}
        >
          <MenuRadioGroup value={value} onValueChange={onSelect}>
            {filterItems.length === 0 && renderEmpty?.()}
            {filterItems.length > 0 && renderItems(filterItems)}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    )
  },
)
Select.displayName = 'Select'
