import { Editable, Hotkey, isTouchDevice, useIsomorphicLayoutEffect } from '@editablejs/editor'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import tw from 'twin.macro'
import { useMentionSearchValue } from '../hooks/use-mention-search'
import { MentionUser } from '../interfaces/mention'
import { getOptions } from '../options'
import { closeMentionDecorate } from '../utils'
import { MentionEditor } from '../plugin/mention-editor'

export interface MentionSearchProps {
  editor: Editable
  container?: HTMLElement
  children?: React.ReactNode
}

const defaultSearch = () => Promise.resolve([])

const defaultRenderEmpty = () => (
  <div tw="p-6 shadow-outer rounded bg-white text-gray-300 text-center min-w-[120px]">None</div>
)

export const MentionSearch: FC<MentionSearchProps> = ({ editor, container, children }) => {
  const value = useMentionSearchValue(editor)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setOpen(true)
  }, [])

  const {
    onSearch = defaultSearch,
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
  const [users, setUsers] = useState<MentionUser[]>([])

  const debounceFn = useCallback(
    debounce(onSearch, debounceWait, {
      maxWait: debounceMaxWait,
      leading: true,
      trailing: false,
    }),
    [onSearch, debounceWait, debounceMaxWait],
  )

  useIsomorphicLayoutEffect(() => {
    debounceFn(value)?.then(users => {
      setUsers(users as MentionUser[])
      setActive(0)
    })
  }, [value])

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isTouchDevice) return
    ref.current?.children[active]?.scrollIntoView({
      block: 'nearest',
    })
  }, [active])

  const handleInsert = useCallback(
    (e?: React.MouseEvent) => {
      const user = users[active]
      if (user) {
        if (e) e.preventDefault()
        MentionEditor.insert(editor, user)
      } else {
        closeMentionDecorate(editor)
      }
    },
    [editor, active, users],
  )

  useIsomorphicLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (Hotkey.match('enter', event)) {
        event.preventDefault()
        handleInsert()
      } else if (Hotkey.match(['up', 'left'], event)) {
        event.preventDefault()
        setActive(value => {
          return value === 0 ? users.length - 1 : value - 1
        })
      } else if (Hotkey.match(['down', 'right'], event)) {
        event.preventDefault()
        setActive(value => {
          return value === users.length - 1 ? 0 : value + 1
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    editor.on('keydown', handleKeyDown)
    return () => {
      editor.off('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, users, handleInsert])

  const renderContent = () => {
    if (onSearchRender) return onSearchRender(users)
    if (users.length === 0) return onSearchRenderEmpty()
    return (
      <ScrollArea tw="shadow-outer rounded bg-white">
        <ScrollAreaViewport
          css={[
            tw`overflow-hidden min-w-[120px] max-h-[calc(30vh)] z-50`,
            isTouchDevice && tw`max-h-[calc(20vh)]`,
          ]}
        >
          <div ref={ref} tw="text-base py-1 ">
            {users.map((user, index) => {
              if (onSearchRenderItem) return onSearchRenderItem(user)
              const { id, name, avatar } = user
              return (
                <div
                  key={id}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={e => e.preventDefault()}
                  onClick={handleInsert}
                  css={[
                    tw`flex items-center cursor-pointer py-1 gap-3 px-4`,
                    !isTouchDevice && tw` hover:bg-gray-100`,
                    !isTouchDevice && active === index && tw`bg-gray-100`,
                  ]}
                >
                  {avatar && (
                    <Avatar tw="rounded-full overflow-hidden text-ellipsis whitespace-nowrap bg-gray-200 text-sm text-gray-400 w-[28px] h-[28px]">
                      <AvatarImage src={avatar} alt={name} tw="rounded-full" />
                      <AvatarFallback delayMs={10000}>{name}</AvatarFallback>
                    </Avatar>
                  )}
                  <span>{name}</span>
                </div>
              )
            })}
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
