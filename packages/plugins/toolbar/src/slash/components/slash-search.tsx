import { Editable, Hotkey, isTouchDevice, useIsomorphicLayoutEffect } from '@editablejs/editor'
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '@editablejs/ui'
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import debounce from 'lodash.debounce'
import tw, { css } from 'twin.macro'
import { useSlashToolbarSearchValue } from '../hooks/use-slash-toolbar-search'
import { getOptions } from '../options'
import { closeSlashDecorate } from '../utils'
import { SlashToolbar, SlashToolbarItem } from '../store'
import { useSlashToolbarItems } from '../hooks/use-slash-toolbar-items'

export interface SlashToolbarSearchProps {
  editor: Editable
  container?: HTMLElement
  children?: React.ReactNode
  onSelect?: () => void
}

const defaultSearch = () => Promise.resolve([])

const defaultRenderEmpty = () => (
  <div tw="p-6 shadow-outer rounded bg-white text-gray-300 text-center min-w-[120px]">None</div>
)

export const SlashToolbarSearch: FC<SlashToolbarSearchProps> = ({
  editor,
  container,
  children,
  onSelect: onContextSelect,
}) => {
  const value = useSlashToolbarSearchValue(editor)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setOpen(true)
  }, [])

  const {
    onSearch,
    onSearchRender,
    onSearchRenderItem,
    onSearchRenderEmpty = defaultRenderEmpty,
    debounceWait = 100,
    debounceMaxWait = 1000,
  } = useMemo(() => {
    return getOptions(editor)
  }, [editor])

  useIsomorphicLayoutEffect(() => {
    // 内容变化主动触发 resize 事件，以便 Popover 跟随内容变化
    const handleChange = () => {
      window.dispatchEvent(new Event('resize'))
    }
    editor.on('change', handleChange)
    return () => {
      editor.off('change', handleChange)
    }
  }, [editor])

  const [active, setActive] = useState(0)
  const items = useSlashToolbarItems(editor)

  const debounceFn = useCallback(
    debounce(onSearch ?? defaultSearch, debounceWait, {
      maxWait: debounceMaxWait,
      leading: true,
      trailing: false,
    }),
    [onSearch, debounceWait, debounceMaxWait],
  )

  useIsomorphicLayoutEffect(() => {
    if (!onSearch) return
    debounceFn(value).then(items => {
      SlashToolbar.setItems(editor, items)
      setActive(0)
    })
  }, [value, onSearch, debounceFn, editor])

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isTouchDevice) return
    ref.current?.children[active]?.scrollIntoView({
      block: 'nearest',
    })
  }, [active])

  const handleInsert = useCallback(
    (e?: React.MouseEvent) => {
      const item = items[active]
      if (item) {
        if (e) e.preventDefault()
        if (onContextSelect) onContextSelect()
        if ('onSelect' in item) item.onSelect?.()
      } else {
        closeSlashDecorate(editor)
      }
    },
    [editor, active, items],
  )

  useIsomorphicLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (Hotkey.match('enter', event)) {
        event.preventDefault()
        event.stopPropagation()
        handleInsert()
      } else if (Hotkey.match(['up', 'left'], event)) {
        event.preventDefault()
        event.stopPropagation()
        setActive(value => {
          return value === 0 ? items.length - 1 : value - 1
        })
      } else if (Hotkey.match(['down', 'right'], event)) {
        event.preventDefault()
        event.stopPropagation()
        setActive(value => {
          return value === items.length - 1 ? 0 : value + 1
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    editor.on('keydown', handleKeyDown)
    return () => {
      editor.off('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, items, handleInsert])

  const renderItem = (item: SlashToolbarItem, index: number) => {
    if (onSearchRenderItem) return onSearchRenderItem(item)
    if ('type' in item) {
      if (index === 0) return null
      return (
        <div
          key={`${item}-${index}`}
          css={[
            tw`my-1 bg-gray-300`,
            css`
              height: 1px;
            `,
          ]}
        />
      )
    }
    if ('content' in item) {
      if (typeof item.content === 'function') {
        const Content = item.content
        return (
          <div css={[tw`px-2 text-gray-500 py-1`]} key={`label-${index}`}>
            <Content onSelect={onContextSelect ?? (() => {})} />
          </div>
        )
      }
      return (
        <div css={[tw`px-2 text-gray-500 py-1`]} key={`label-${index}`}>
          {item.content}
        </div>
      )
    }
    const { title, disabled, icon, key } = item

    return (
      <div
        key={key}
        css={[
          tw`relative flex cursor-pointer items-center pl-7 pr-2 text-center hover:bg-gray-100 py-1`,
          !isTouchDevice && tw` hover:bg-gray-100`,
          !isTouchDevice && active === index && tw`bg-gray-100`,
          disabled && tw`text-gray-400 cursor-default`,
        ]}
        onMouseEnter={() => setActive(index)}
        onMouseDown={event => {
          event.preventDefault()
          if (onContextSelect) onContextSelect()
          item.onSelect?.()
        }}
      >
        {icon && (
          <span
            css={[
              tw`absolute left-2 top-0 flex items-center h-full`,
              !disabled && tw`text-gray-500`,
              disabled && tw`text-gray-400 cursor-default`,
            ]}
          >
            {icon}
          </span>
        )}
        {title}
      </div>
    )
  }

  const renderItems = (items: SlashToolbarItem[]) => {
    return items.map((item, index) => {
      return renderItem(item, index)
    })
  }

  const renderContent = () => {
    if (onSearchRender) return onSearchRender(items)
    if (items.length === 0) return onSearchRenderEmpty()
    return (
      <ScrollArea tw="shadow-outer rounded bg-white">
        <ScrollAreaViewport
          css={[
            tw`overflow-hidden min-w-[120px] max-h-[calc(30vh)] z-50`,
            isTouchDevice && tw`max-h-[calc(20vh)]`,
          ]}
        >
          <div ref={ref} tw="text-base py-1 ">
            {renderItems(items)}
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical" tw="rounded-tr rounded-br">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
        <ScrollAreaCorner />
      </ScrollArea>
    )
  }

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverPortal container={container}>
        <PopoverContent sideOffset={2} align="start" autoUpdate={true}>
          {renderContent()}
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
