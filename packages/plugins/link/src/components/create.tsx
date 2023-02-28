import { Range, Transforms, Text } from '@editablejs/models'
import {
  Editable,
  SlotComponentProps,
  useEditableStatic,
  useIsomorphicLayoutEffect,
  useSelectionDrawingRects,
  useLocale,
} from '@editablejs/editor'
import { Popover, PopoverContent, PopoverPortal, PopoverAnchor, Button } from '@editablejs/ui'
import React, { FC, useEffect, useRef, useState } from 'react'
import { LINK_KEY } from '../constants'
import { Link } from '../interfaces/link'
import { LinkLocale } from '../locale'
import { useLinkOpen } from '../store'
import { StyledInput } from './styled'

export interface LinkCreateComponentProps extends SlotComponentProps {}

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

  useEffect(() => {
    if (rects.length > 0) {
      const rect = rects[rects.length - 1]
      const [x, y] = Editable.reverseRelativePosition(editor, rect.x, rect.bottom)
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
    <Popover open={open} onOpenChange={setOpen} trigger={[]}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverPortal>
        <PopoverContent align="start" sideOffset={5}>
          <div tw="shadow-md rounded px-4 py-2 border border-gray-300 bg-white text-base">
            <div tw="flex gap-2 items-center">
              <label>{locale.link}</label>
              <StyledInput
                placeholder={locale.linkPlaceholder}
                value={url}
                onChange={e => setUrl(e.target.value)}
                type="url"
                ref={inputRef}
              />
              <Button disabled={!url} type="primary" onClick={handleOk}>
                {locale.ok}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

LinkCreateComponent.displayName = 'LinkCreateComponent'
