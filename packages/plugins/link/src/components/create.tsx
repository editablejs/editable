import {
  Editable,
  Range,
  SlotComponentProps,
  Transforms,
  useEditableStatic,
  useIsomorphicLayoutEffect,
  useSelectionDrawingRects,
  Text,
  useLocale,
} from '@editablejs/editor'
import { Popover, PopoverContent, PopoverPortal, PopoverAnchor } from '@editablejs/plugin-ui'
import React, { FC, useEffect, useRef, useState } from 'react'
import tw from 'twin.macro'
import { LINK_KEY } from '../constants'
import { Link } from '../interfaces/link'
import { LinkLocale } from '../locale'
import { useLinkOpen } from '../store'

export interface LinkCreateComponentProps extends SlotComponentProps {}

const StyledInput = tw.input`border-gray-300 border rounded px-1 outline-0 min-w-[280px] hover:border-gray-300 hover:border focus:border-gray-300 focus:border`

export const LinkCreateComponent: FC<LinkCreateComponentProps> = () => {
  const editor = useEditableStatic()

  const [url, setUrl] = useState('')

  const [open, setOpen] = useLinkOpen()

  const inputRef = useRef<HTMLInputElement>(null)

  const pointRef = React.useRef({ x: 0, y: 0 })

  const virtualRef = React.useRef({
    getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...pointRef.current }),
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const rects = useSelectionDrawingRects()

  useIsomorphicLayoutEffect(() => {
    if (rects.length > 0) {
      const rect = rects[rects.length - 1]
      const [x, y] = Editable.toGlobalPosition(editor, rect.x, rect.bottom)
      pointRef.current = {
        x,
        y,
      }
    } else {
      pointRef.current = {
        x: 0,
        y: 0,
      }
    }
  }, [rects])

  const handleOk = () => {
    const link: Link = {
      type: LINK_KEY,
      href: url,
      children: [{ text: 'link' }],
    }
    if (!editor.selection || Range.isCollapsed(editor.selection)) {
      Transforms.insertNodes(editor, link)
    } else {
      Transforms.wrapNodes(editor, link, {
        match: n => Text.isText(n),
        split: true,
      })
      Transforms.select(editor, Range.end(editor.selection))
    }
    setOpen(false)
  }

  const locale = useLocale<LinkLocale>('link')

  return (
    <Popover open={open} onOpenChange={setOpen} trigger="none">
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverPortal>
        <PopoverContent align="start">
          <div tw="shadow-md rounded px-4 py-2 border border-gray-300 bg-white text-base">
            <div tw="flex gap-2">
              <label>{locale.link}</label>
              <StyledInput
                placeholder={locale.linkPlaceholder}
                value={url}
                onChange={e => setUrl(e.target.value)}
                type="url"
                ref={inputRef}
              />
              <button
                disabled={!url}
                tw="bg-blue-600 rounded text-white py-0.5 px-6 border-0 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed"
                onClick={handleOk}
              >
                {locale.ok}
              </button>
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

LinkCreateComponent.displayName = 'LinkCreateComponent'
