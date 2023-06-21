import {
  Editable,
  ElementAttributes,
  useIsomorphicLayoutEffect,
  useLocale,
  useNodeFocused,
  useReadOnly,
} from '@editablejs/editor'
import { Editor, Range, Transforms } from '@editablejs/models'
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Icon,
  Button,
} from '@editablejs/ui'
import { TextSerializer } from '@editablejs/serializer/text'
import React, { forwardRef, useState } from 'react'
import { LinkEditor } from '../plugin/link-editor'
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

  const focused = useNodeFocused()
  useIsomorphicLayoutEffect(() => {
    setOpen(focused)
  }, [focused])

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

  const [readOnly] = useReadOnly()

  if (readOnly) {
    return (
      <a
        tw="font-medium mb-2 mt-0 text-blue-600 underline"
        {...props}
        href={readOnly ? url : undefined}
        target={readOnly ? '_blank' : undefined}
        ref={ref}
        onClick={() => window.open(url, '_blank')}
        rel="noreferrer"
      >
        {children}
      </a>
    )
  }
  return (
    <Popover open={readOnly ? false : open} onOpenChange={state => setOpen(focused ? true : state)}>
      <PopoverTrigger>
        <a tw="font-medium mb-2 mt-0 text-blue-600 underline" {...props} ref={ref}>
          {children}
        </a>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent align="start" sideOffset={5}>
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
