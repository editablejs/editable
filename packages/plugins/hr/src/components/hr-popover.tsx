import {
  useIsomorphicLayoutEffect,
  useLocale,
  useNodeFocused,
  useReadOnly,
} from '@editablejs/editor'
import {
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Toolbar,
  ToolbarColorPicker,
  ToolbarDropdown,
  Tooltip,
} from '@editablejs/ui'
import { FC, useState } from 'react'
import { DEFAULT_HR_STYLE, DEFAULT_HR_WIDTH, DEFUALT_HR_COLOR } from '../constants'
import { HrEditor } from '../plugin/hr-editor'
import { Hr, HrStyle } from '../interfaces/hr'
import { HrLocale } from '../locale/types'
import { StyleIcon, ThicknessIcon } from './icons'

export interface HrPopoverProps {
  editor: HrEditor
  element: Hr
  children?: React.ReactNode
}

export const HrPopover: FC<HrPopoverProps> = ({ editor, element, children }) => {
  const focused = useNodeFocused()
  const [readOnly] = useReadOnly()
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

  const { toolbar } = useLocale<HrLocale>('hr')

  return (
    <Popover
      open={readOnly ? false : popoverOpen}
      onOpenChange={handlePopoverOpenChange}
      trigger="hover"
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent autoUpdate={true} side="top" sideOffset={5}>
        <Toolbar mode="inline">
          <Tooltip content={toolbar.color} side="top" sideOffset={5} arrow={false}>
            <ToolbarColorPicker
              defaultValue={DEFUALT_HR_COLOR}
              defaultColor={{
                color: DEFUALT_HR_COLOR,
                title: toolbar.defaultColor,
              }}
              onSelect={color => editor.setColorHr(color, element)}
            >
              <Icon name="fontColor" />
            </ToolbarColorPicker>
          </Tooltip>
          <Tooltip content={toolbar.style} side="top" sideOffset={5} arrow={false}>
            <ToolbarDropdown
              onSelect={value => editor.setStyleHr(value as HrStyle, element)}
              value={element.style || DEFAULT_HR_STYLE}
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
          <Tooltip content={toolbar.width} side="top" sideOffset={5} arrow={false}>
            <ToolbarDropdown
              onSelect={value => editor.setWidthHr(Number(value), element)}
              value={String(element.width || DEFAULT_HR_WIDTH)}
              items={[
                {
                  value: '1',
                  content: (
                    <div tw="min-h-[24px] flex items-center">
                      <hr tw="h-[1px] border-none leading-[1px] w-16 bg-black" />
                    </div>
                  ),
                },
                {
                  value: '2',
                  content: (
                    <div tw="min-h-[24px] flex items-center">
                      <hr tw="h-[2px] border-none leading-[2px] w-16 bg-black" />
                    </div>
                  ),
                },
                {
                  value: '4',
                  content: (
                    <div tw="min-h-[24px] flex items-center">
                      <hr tw="h-[4px] border-none leading-[4px] w-16 bg-black" />
                    </div>
                  ),
                },
                {
                  value: '6',
                  content: (
                    <div tw="min-h-[24px] flex items-center">
                      <hr tw="h-[6px] border-none leading-[6px] w-16 bg-black" />
                    </div>
                  ),
                },
              ]}
            >
              <ThicknessIcon />
            </ToolbarDropdown>
          </Tooltip>
        </Toolbar>
      </PopoverContent>
    </Popover>
  )
}
