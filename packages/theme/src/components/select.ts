import tw, { css } from 'twin.macro'
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
  MenuProps,
} from './menu'
import { HTMLAttributes, HTMLInputTypeAttribute, Ref, html, nothing, useEffect, useMemo, useRef, useState, virtual } from 'rezon'
import { repeat } from 'rezon/directives/repeat'
import { spread } from 'rezon/directives/spread'

export interface SelectItemProps extends Omit<MenuItem, 'onSelect' | 'textValue'> {
  value: string
  content?: string
  disabled?: boolean
}

type SelectSize = 'small' | 'default' | 'large'

export interface SelectProps extends Omit<MenuProps, 'children'> {
  ref?: Ref<HTMLInputElement>
  className?: string
  size?: SelectSize
  value?: string
  defaultValue?: string
  placeholder?: string
  defaultActiveFirstItem?: boolean
  disabled?: boolean
  items: SelectItem[]
  onSelect?: (value: string) => void
  renderEmpty?: () => unknown
}

export type SelectItem = SelectItemProps | 'separator'

const sizeCls = (size: SelectSize = 'default') => [
  tw`py-2`,
  size === 'small' && tw`py-1 pr-2 pl-5`,
  size === 'large' && tw`py-3 pr-5 pl-12`,
]

interface StyledInputProps extends HTMLAttributes<HTMLInputElement> {
  size: SelectSize
  value?: string
  type: HTMLInputTypeAttribute
  disabled?: boolean
  ref: Ref<HTMLInputElement>
}

const StyledInput = virtual<StyledInputProps>(({ size }) => {

  return html`<input class=${css([
    tw`px-1.5 bg-transparent text-base outline-0 absolute top-0 bottom-0 w-full`,
    size === 'small' && tw`px-0.5 gap-1`,
    size === 'large' && tw`px-2.5 gap-3`,
  ])}></input>`
})

export const Select = virtual<SelectProps>(
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
      ref,
      ...props
    },
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const defaultValue = useMemo(() => {
      if (defaultValueProps) return defaultValueProps
      const firstItem = items.find(item => item !== 'separator')
      return defaultActiveFirstItem && typeof firstItem === 'object' ? firstItem.value : ''
    }, [defaultActiveFirstItem, items, defaultValueProps])

    const [filterItems, setFilterItems] = useState(items)
    const [value, setValue] = useState(defaultValue)

    const activeItem = useMemo(() => {
      const findItem = (items: SelectItem[]): SelectItemProps | null => {
        for (const item of items) {
          if (item !== 'separator' && item.value === value) return item
        }
        return null
      }
      return findItem(items)
    }, [items, value])

    const [search, setSearch] = useState('')

    useEffect(() => {
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

    useEffect(() => {
      setValue(valueProps ?? defaultValue)
    }, [defaultValue, valueProps])

    const renderItems = (items: SelectItem[]) => {
      return repeat(items, (item, index) => item === 'separator' ? index : item.value, (item, index) => {
        if (item === 'separator') {
          return MenuSeparator({})
        } else {
          const { value, disabled, content, ...props } = item
          return MenuRadioItem({
            disabled,
            value,
            className: css([
              tw`relative flex cursor-pointer items-center pl-9 pr-4 hover:bg-gray-100`,
              sizeCls(size),
            ]),
            onSelect: e => handleSelect(e, value),
            onMouseDown: e => e.preventDefault(),
            ...props,
            children: [
              MenuItemIndicator({
                className: css([
                  tw`absolute left-3 top-0 flex items-center h-full text-gray-400`,
                  size === 'small' && tw`left-2`,
                  size === 'large' && tw`left-4`,
                ]),
                children: Icon({
                  name: 'check'
                })
              }),
              content ?? value
            ]
          })
        }
      })
    }

    const { open: openProp, onOpenChange, dir, ...triggerProps } = props

    const [open, setOpen] = useState(openProp)

    return Menu({
      open,
      onOpenChange,
      dir,
      children: [
        MenuAnchor({
          children: html`<span data-open="${open || undefined}" class="${css([
            tw`relative inline-flex items-center justify-between border border-gray-300 rounded hover:border-primary focus-within:border-primary`,
            css`
                &[data-open='true'] {
                  ${tw`bg-gray-100`}
                }
              `,
          ])}"
            @pointerdown=${(event: MouseEvent) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                if (event.target !== inputRef.current) {
                  event.preventDefault()
                  inputRef.current?.focus()
                }
                setOpen(!open)
              }
            }}
          @keydown=${(event: KeyboardEvent) => {
              if (disabled) return
              if (['Enter', ' '].includes(event.key)) setOpen(!open)
              if (event.key === 'ArrowDown') setOpen(true)
              // prevent keydown from scrolling window / first focused item to execute
              // that keydown (inadvertently closing the menu)
              if (['Enter', ' ', 'ArrowDown'].includes(event.key)) event.preventDefault()
            }}

          ${spread(triggerProps)}
          >
            ${StyledInput({
              type: 'text',
              size,
              value: search,
              onChange: (event: Event) => {
                if (event.target instanceof HTMLInputElement) setSearch(event.target.value)
              },
              disabled,
              placeholder: open && !activeItem?.value ? placeholder : undefined,
              ref: composeRefs(inputRef, ref)
            })
            }
            <span class="${css([
              tw`w-full px-1.5 relative inline-block select-none overflow-hidden whitespace-nowrap text-ellipsis cursor-text`,
              size === 'small' && tw`px-0.5`,
              size === 'large' && tw`px-2.5`,
              ((open && !search) || (!open && !value)) && tw`text-gray-400`,
              open && !!search && tw`text-transparent`,
            ])}">
              ${activeItem?.content ?? activeItem?.value ?? placeholder}
            </span>
            ${Icon({
              name: 'arrowCaretDown',
              className: css([
                tw`text-xxs text-gray-400 mr-2 ml-1 transition-all`,
                open && tw`rotate-180 mt-1`,
              ])
            })}
          </span>`
        }),
        MenuContent({
          align: 'start',
          sideOffset: 1,
          onEscapeKeyDown: () => setOpen(false),
          onPointerDownOutside: () => setOpen(false),
          className: css([
            tw`overflow-hidden text-base py-1 w-full rounded-md border border-zinc-200 bg-white shadow-md z-50`,
            size === 'small' && tw`text-sm`,
            size === 'large' && tw`text-lg`,
          ]),
          children: MenuRadioGroup({
            value,
            onValueChange: onSelect,
            children: [
              filterItems.length === 0 ? renderEmpty?.() : nothing,
              filterItems.length > 0 ? renderItems(filterItems) : nothing
            ]
          })
        })
      ]
    })
  }
)
