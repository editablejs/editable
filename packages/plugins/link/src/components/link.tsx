import {
  Editable,
  Editor,
  ElementAttributes,
  Range,
  TextSerializer,
  Transforms,
  useIsomorphicLayoutEffect,
  useLocale,
  useNodeSelected,
} from '@editablejs/editor'
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Icon,
  Button,
} from '@editablejs/plugin-ui'
import React, { forwardRef, useState } from 'react'
import tw from 'twin.macro'
import { LinkEditor } from '../editor'
import { Link } from '../interfaces/link'
import { LinkLocale } from '../locale'
import { StyledInput } from './styled'

export interface LinkComponentProps extends ElementAttributes {
  editor: LinkEditor
  element: Link
}

export const LinkComponent = forwardRef<
  HTMLAnchorElement,
  LinkComponentProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ children, element, editor, ...props }, ref) => {
  const { href } = element

  const defaultText = element.children
    .map(node => TextSerializer.transformWithEditor(editor, node))
    .join('')
  const [text, setText] = useState(defaultText)
  const [url, setUrl] = useState(href)

  const [open, setOpen] = useState(false)

  const selected = useNodeSelected()
  useIsomorphicLayoutEffect(() => {
    setOpen(selected)
  }, [selected])

  const handleCancel = () => {
    editor.cancelLink(element)
  }

  const handleOk = () => {
    const newText = text || url
    Transforms.setNodes<Link>(editor, {
      href: url,
    })
    if (defaultText !== newText) {
      const path = Editable.findPath(editor, element)
      element.children.forEach((_, index) => {
        Transforms.removeNodes(editor, {
          at: path.concat(index),
        })
      })
      Transforms.insertNodes(
        editor,
        {
          text: newText,
        },
        {
          at: path.concat(0),
        },
      )
      const range = Editor.range(editor, path)
      Transforms.select(editor, Range.end(range))
    }
    setOpen(false)
  }

  const locale = useLocale<LinkLocale>('link')

  return (
    <Popover open={open} onOpenChange={state => setOpen(selected ? true : state)} trigger="click">
      <PopoverTrigger>
        <a tw="font-medium mb-2 mt-0 text-blue-600 underline" {...props} ref={ref}>
          {children}
        </a>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent align="start">
          <div tw="shadow-md rounded px-4 py-2 border border-gray-300 bg-white text-base">
            <div tw="flex gap-2 mb-2 items-center">
              <label>{locale.text}</label>
              <StyledInput
                value={text}
                onChange={e => setText(e.target.value)}
                type="text"
                placeholder={locale.textPlaceholder}
              />
            </div>
            <div tw="flex gap-2 mb-2 items-center">
              <label>{locale.link}</label>
              <StyledInput
                value={url}
                onChange={e => setUrl(e.target.value)}
                type="url"
                placeholder={locale.linkPlaceholder}
              />
            </div>
            <div tw="flex justify-end gap-2">
              <Button icon={<Icon name="unLink" />} type="text" onClick={handleCancel}>
                {locale.cancelLink}
              </Button>
              <Button onClick={handleOk} type="primary">
                {locale.ok}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
})

LinkComponent.displayName = 'LinkComponent'
