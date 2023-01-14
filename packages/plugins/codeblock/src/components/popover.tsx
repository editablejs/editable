import { useIsomorphicLayoutEffect, useLocale, useNodeFocused } from '@editablejs/editor'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Toolbar,
  ToolbarDropdown,
  Tooltip,
} from '@editablejs/ui'
import { FC, useState } from 'react'
import { CodeBlockEditor } from '../plugin/editor'
import { CodeBlockLocale } from '../locale/types'
import { StyleIcon, ThicknessIcon } from './icons'
import { CodeBlock } from '../interfaces/codeblock'

export interface CodeBlockPopoverProps {
  editor: CodeBlockEditor
  element: CodeBlock
  children?: React.ReactNode
}

export const CodeBlockPopover: FC<CodeBlockPopoverProps> = ({ editor, element, children }) => {
  const focused = useNodeFocused()

  const [popoverOpen, setPopoverOpen] = useState(false)

  const handlePopoverOpenChange = (open: boolean) => {
    if (focused) {
      setPopoverOpen(true)
    } else {
      setPopoverOpen(open)
    }
  }

  useIsomorphicLayoutEffect(() => {
    setPopoverOpen(focused)
  }, [focused])

  const { toolbar } = useLocale<CodeBlockLocale>('codeblock')

  return (
    <Popover open={false} onOpenChange={handlePopoverOpenChange} trigger="hover">
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent autoUpdate={true} side="top" sideOffset={5}>
        <Toolbar mode="inline">
          <Tooltip content={'sdfdf'} side="top" sideOffset={5} arrow={false}>
            <ToolbarDropdown
              // onSelect={value => editor.setStyleCodeBlock(value as CodeBlockStyle, element)}
              // value={element.style || DEFAULT_HR_STYLE}
              items={[
                {
                  value: 'dashed',
                  content: (
                    <div tw="min-h-[24px] flex items-center">
                      <div tw="border-t-2 border-dashed leading-[2px] w-16 border-black" />
                    </div>
                  ),
                },
                {
                  value: 'solid',
                  content: (
                    <div tw="min-h-[24px] flex items-center">
                      <div tw="border-t-2 border-solid leading-[2px] w-16 border-black" />
                    </div>
                  ),
                },
                {
                  value: 'dotted',
                  content: (
                    <div tw="min-h-[24px] flex items-center">
                      <div tw="border-t-2 border-dotted leading-[2px] w-16 border-black" />
                    </div>
                  ),
                },
                {
                  value: 'double',
                  content: (
                    <div tw="min-h-[24px] flex items-center">
                      <div tw="border-t-2 border-double leading-[2px] w-16 border-black" />
                    </div>
                  ),
                },
              ]}
            >
              <StyleIcon />
            </ToolbarDropdown>
          </Tooltip>
        </Toolbar>
      </PopoverContent>
    </Popover>
  )
}
