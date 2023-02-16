import { Editable } from '@editablejs/editor'
import { forwardRef, useMemo } from 'react'
import { useSlashToolbarSearchValue } from '../hooks/use-slash-toolbar-search'
import { getOptions } from '../options'

export interface SlashToolbarPlaceholderProps {
  editor: Editable
  children: React.ReactElement
}

export const SlashToolbarPlaceholder = forwardRef<HTMLSpanElement, SlashToolbarPlaceholderProps>(
  ({ editor, children }, ref) => {
    const { placeholder } = useMemo(() => {
      return getOptions(editor)
    }, [editor])

    const searchValue = useSlashToolbarSearchValue(editor)
    const renderChildren = () => {
      if (searchValue) return children
      if (typeof placeholder === 'function') return placeholder(children)
      if (typeof placeholder === 'string')
        return (
          <>
            {children}
            <span tw="text-gray-300 opacity-80">{placeholder}</span>
          </>
        )

      return children
    }

    return (
      <span tw="inline-block" ref={ref}>
        {renderChildren()}
      </span>
    )
  },
)

SlashToolbarPlaceholder.displayName = 'SlashToolbarPlaceholder'
