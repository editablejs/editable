import { Root, Content, ItemIndicator, Separator, Trigger, DropdownMenuProps, DropdownMenuItemProps, RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Icon } from './icon';

export interface DropdownItemProps extends Omit<DropdownMenuItemProps, 'onSelect' | 'textValue'> {
  value: string
  content?: ReactNode;
  disabled?: boolean;
}

export interface DropdownProps extends Omit<DropdownMenuProps, 'modal'> {
  value?: string
  defaultValue?: string
  defaultActiveFirstItem?: boolean;
  calssName?: string;
  disabled?: boolean;
  items: DropdownItem[];
  onValueChange?: (value: string) => void
}

type DropdownItem = DropdownItemProps | "separator"

export const Dropdown: FC<DropdownProps> = ({ children, disabled, items, defaultActiveFirstItem = true, calssName, onValueChange, defaultValue: defaultValueProps, value: valueProps, ...props }) => {

  const defaultValue = useMemo(() => {
    if (defaultValueProps) return defaultValueProps
    const firstItem = items.find(item => item !== 'separator');
    return defaultActiveFirstItem && typeof firstItem ==='object' ? firstItem.value : ''
  }, [defaultActiveFirstItem, items, defaultValueProps])

  const [value, setValue] = useState(defaultValue)

  const handleSelect = (e: Event, v: string) => {
    setValue(v)
    if(onValueChange) onValueChange(value)
  }

  useEffect(() => {
    setValue(valueProps ?? defaultValue)
  }, [defaultValue, valueProps])

  const renderItems = (items: DropdownItem[]) => {
    return items.map((item, index) => {
      if (item === "separator") {
        return <Separator key={index} />;
      } else {
        const { value, content, disabled, ...props } = item
        return <RadioItem
        disabled={disabled}
        key={value}
        value={value}
        className='ea-flex ea-items-center ea-py-1 ea-pl-6 ea-pr-3 ea-relative ea-cursor-pointer ea-text-center hover:ea-bg-gray-100'
        onSelect={e => handleSelect(e, value)}
        onMouseDown={e => e.preventDefault()}
        ref={ref => {
          if(ref) ref.focus = () => {}
        }}
        {...props}>
          <ItemIndicator className='ea-absolute ea-w-6 ea-left-0 ea-top-1 ea-text-gray-400'>
            <Icon name="check" />
          </ItemIndicator>
          {content ?? value}
      </RadioItem>
      }
    })
  }

  const {
    open,
    defaultOpen,
    onOpenChange,
    dir,
    ...triggerProps
  } = props

  const activeItem = useMemo(() => {
    const findItem = (items: DropdownItem[]): DropdownItemProps | null => {
      for(const item of items) {
        if(item !== 'separator' && item.value === value) return item
      }
      return null
    }
    return findItem(items)
  }, [items, value])

  return (
    <Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} dir={dir} modal={false}>
      <Trigger
      disabled={disabled}
      ref={ref => {
        if(ref) ref.focus = () => {}
      }}
      className={classNames(calssName, 'ea-inline-flex ea-items-center ea-border-none ea-outline-none ea-content-center ea-rounded ea-gap-2 ea-px-1 ea-py-1 ea-bg-white hover:ea-bg-gray-100 ea-cursor-pointer')}
      {...triggerProps}>
        {children ?? activeItem?.children ?? value}
        <Icon name="arrowCaretDown" className='ea-text-xxs ea-text-gray-400' />
      </Trigger>
      <Content
      ref={ref => {
        if(ref) ref.focus = () => {}
      }}
      loop={true}
      align="start"
      className='ea-overflow-hidden ea-bg-white ea-rounded-md ea-shadow-md ea-border ea-border-gray-200 ea-border-solid ea-text-sm'>
        <RadioGroup value={value} onValueChange={onValueChange}>
        {
          renderItems(items)
        }
        </RadioGroup>
      </Content>
    </Root>
  )
}
