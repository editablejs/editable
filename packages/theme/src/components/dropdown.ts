import tw, { css } from 'twin.macro'
import {
  MenuAnchor,
  MenuContent,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  Menu,
  MenuSeparator,
  MenuItem,
  MenuProps,
} from './menu'
import { Ref, nothing, useEffect, useMemo, useState, virtual } from 'rezon'
import { size } from '@floating-ui/dom'
import { ref } from 'rezon/directives/ref'
import { repeat } from 'rezon/directives/repeat'
import { Icon } from './icon'
import { Button } from './button'

export interface DropdownItemProps extends Omit<MenuItem, 'onSelect' | 'textValue'> {
  value: string
  icon?: unknown
  content?: unknown
  disabled?: boolean
}

type DropdownSize = 'small' | 'default' | 'large'

export interface DropdownProps extends MenuProps {
  ref?: Ref<HTMLButtonElement>
  className?: string
  size?: DropdownSize
  value?: string
  defaultValue?: string
  defaultActiveFirstItem?: boolean
  disabled?: boolean
  items: DropdownItem[]
  onSelect?: (value: string) => void
}

type DropdownItem = DropdownItemProps | 'separator'

const sizeCls = (size: DropdownSize = 'default', align: 'left' | 'right' = 'left') => [
  tw`py-2`,
  size === 'small' && (align === 'left' ? tw`py-1 pr-2 pl-5` : tw`py-1 pr-5 pl-2`),
  size === 'large' && (align === 'left' ? tw`py-3 pr-5 pl-12` : tw`py-3 pr-12 pl-5`),
]

export const Dropdown = virtual<DropdownProps>(
  (
    {
      children,
      disabled,
      items,
      defaultActiveFirstItem = true,
      onSelect,
      defaultValue: defaultValueProps,
      value: valueProps,
      size = 'default',
      ref,
      ...props
    }
  ) => {
    const defaultValue = useMemo(() => {
      if (defaultValueProps) return defaultValueProps
      const firstItem = items.find(item => item !== 'separator')
      return defaultActiveFirstItem && typeof firstItem === 'object' ? firstItem.value : ''
    }, [defaultActiveFirstItem, items, defaultValueProps])

    const [value, setValue] = useState(defaultValue)

    const handleSelect = (e: Event, v: string) => {
      setValue(v)
      if (onSelect) onSelect(value)
      setOpen(false)
    }

    useEffect(() => {
      setValue(valueProps ?? defaultValue)
    }, [defaultValue, valueProps])

    const renderItems = (items: DropdownItem[]) => {
      return repeat(items, (item, index) => item === 'separator' ? index : item.value, (item) => {
        if (item === 'separator') {
          return MenuSeparator({})
        } else {
          const { value, content, icon, disabled, ...props } = item
          return MenuRadioItem({
            disabled,
            value,
            className: css([
              tw`relative flex cursor-pointer items-center pl-9 pr-4 hover:bg-gray-100`,
              sizeCls(size, icon ? 'right' : 'left'),
              !!icon && tw`pl-4 pr-9`,
            ]),
            onSelect: e => handleSelect(e, value),
            onMouseDown: e => e.preventDefault(),
            ...props,
            children: [MenuItemIndicator({
              className: css([
                tw`absolute left-3 top-0 flex items-center h-full text-gray-400`,
                size === 'small' && tw`left-2`,
                size === 'large' && tw`left-4`,
                !!icon && tw`right-4 left-auto`,
              ]),
              children: Icon({ name: 'check' }),
            }),
            icon ? Icon({ name: 'check', className: css(tw`mr-2 text-xl`) }) : nothing,
            content ?? value,
            ],
          })
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

    return Menu({
      open,
      onOpenChange,
      dir,
      children: [
        MenuAnchor({
          children: Button({
            type: 'text',
            // size,
            disabled,
            className: css([
              tw`inline-flex content-center items-center gap-2 px-1.5`,
              size === 'small' && tw`px-0.5 gap-1`,
              size === 'large' && tw`px-2.5 gap-3`,
              css`
                &[data-open='true'] {
                  ${tw`bg-gray-100`}
                }
              `,
            ]),
            'data-open': open || undefined,
            ...triggerProps,
            onPointerDown: event => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                setOpen(!open)
                event.preventDefault()
              }
            },
            onKeyDown: event => {
              if (disabled) return
              if (['Enter', ' '].includes(event.key)) setOpen(!open)
              if (event.key === 'ArrowDown') setOpen(true)
              // prevent keydown from scrolling window / first focused item to execute
              // that keydown (inadvertently closing the menu)
              if (['Enter', ' ', 'ArrowDown'].includes(event.key)) event.preventDefault()
            },
            ref,
            children: [
              children ?? activeItem?.content ?? value,
              Icon({
                name: 'arrowCaretDown',
                className: css([
                  tw`text-xxs text-gray-400 transition-all`,
                  open && tw`rotate-180 mt-1`,
                ]),
              }),
            ],
          })
        }),
        MenuContent({
          align: 'start',
          sideOffset: 1,
          onEscapeKeyDown: () => setOpen(false),
          onPointerDownOutside: () => setOpen(false),
          className: css([
            tw`overflow-hidden text-base py-1 rounded-md border border-zinc-200 bg-white shadow-md z-50`,
            size === 'small' && tw`text-sm`,
            size === 'large' && tw`text-lg`,
          ]),
          children: MenuRadioGroup({
            value,
            onValueChange: onSelect,
            children: renderItems(items),
          }),
        }),
      ]
    })
  }
)
