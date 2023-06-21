import {
  useIsomorphicLayoutEffect,
  useLocale,
  useNodeFocused,
  useReadOnly,
} from '@editablejs/editor'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Toolbar,
  Tooltip,
  ToolbarSelect,
  ToolbarDropdown,
} from '@editablejs/ui'
import { FC, useMemo, useState } from 'react'
import { CodeBlockEditor } from '../plugin/editor'
import { CodeBlockLocale } from '../locale/types'
import { CodeBlock } from '../interfaces/codeblock'
import { getOptions } from '../options'
import { EditorView } from '@codemirror/view'
import { AutoWrapIcon, OverflowIcon, ThemeIcon } from './icons'
import { colors as baseLightColors } from '../themes/base-light'
import { colors as oneDarkColors } from '../themes/one-dark'

export interface CodeBlockPopoverProps {
  editor: CodeBlockEditor
  element: CodeBlock
  children?: React.ReactNode
  view: EditorView | null
}

export const CodeBlockPopover: FC<CodeBlockPopoverProps> = ({
  editor,
  element,
  children,
  view,
}) => {
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

  const languages = useMemo(() => {
    const { languages } = getOptions(editor)
    if (!languages)
      return [
        {
          value: 'plain',
          content: 'Plain text',
        },
      ]
    return languages.map(({ value, content }) => ({
      value,
      content,
    }))
  }, [editor])

  const { toolbar } = useLocale<CodeBlockLocale>('codeblock')

  const language = languages.find(({ value }) => value === element.language)

  return (
    <Popover
      open={readOnly ? false : popoverOpen}
      onOpenChange={handlePopoverOpenChange}
      trigger="hover"
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent autoUpdate={true} side="top" sideOffset={5}>
        <Toolbar mode="inline">
          <Tooltip content={toolbar.theme.title} side="top" sideOffset={5} arrow={false}>
            <ToolbarDropdown
              value={element.theme}
              onSelect={value => {
                CodeBlockEditor.updateCodeBlock(editor, element, {
                  theme: value as 'light' | 'dark',
                })
              }}
              items={[
                {
                  value: 'light',
                  icon: (
                    <span
                      tw="w-4 h-4 flex border border-zinc-200 rounded"
                      style={{ backgroundColor: baseLightColors.background }}
                    ></span>
                  ),
                  content: toolbar.theme.light,
                },
                {
                  value: 'dark',
                  icon: (
                    <span
                      tw="w-4 h-4 flex border border-zinc-200 rounded"
                      style={{ backgroundColor: oneDarkColors.background }}
                    ></span>
                  ),
                  content: toolbar.theme.dark,
                },
              ]}
            >
              <span tw="text-xl">
                <ThemeIcon />
              </span>
            </ToolbarDropdown>
          </Tooltip>
          <Tooltip content={toolbar.language.title} side="top" sideOffset={5} arrow={false}>
            <ToolbarSelect
              onSelect={value => {
                CodeBlockEditor.updateCodeBlock(editor, element, { language: value })
                view?.focus()
              }}
              defaultValue={language?.value}
              value={language?.value}
              items={languages}
              renderEmpty={() => <div tw="p-4 text-center">{toolbar.language.searchEmpty}</div>}
            />
          </Tooltip>
          <Tooltip content={toolbar.lineWrapping.title} side="top" sideOffset={5} arrow={false}>
            <ToolbarDropdown
              value={element.lineWrapping ? 'autoWrap' : 'overflow'}
              onSelect={value => {
                CodeBlockEditor.updateCodeBlock(editor, element, {
                  lineWrapping: value === 'autoWrap',
                })
              }}
              items={[
                {
                  value: 'autoWrap',
                  icon: <AutoWrapIcon />,
                  content: toolbar.lineWrapping.autoWrap,
                },
                {
                  value: 'overflow',
                  icon: <OverflowIcon />,
                  content: toolbar.lineWrapping.overflow,
                },
              ]}
            >
              <span tw="text-xl">{element.lineWrapping ? <AutoWrapIcon /> : <OverflowIcon />}</span>
            </ToolbarDropdown>
          </Tooltip>
          <Tooltip content={toolbar.tabSize} side="top" sideOffset={5} arrow={false}>
            <ToolbarDropdown
              value={String(element.tabSize ?? 2)}
              onSelect={value => {
                CodeBlockEditor.updateCodeBlock(editor, element, { tabSize: Number(value) })
              }}
              items={[
                {
                  value: '2',
                  content: '2',
                },
                {
                  value: '4',
                  content: '4',
                },
                {
                  value: '8',
                  content: '8',
                },
              ]}
            >
              {toolbar.tabSize}
            </ToolbarDropdown>
          </Tooltip>
        </Toolbar>
      </PopoverContent>
    </Popover>
  )
}
