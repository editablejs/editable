import { Editable } from '@editablejs/editor'
import { forwardRef, useMemo } from 'react'
import { useMentionSearchValue } from '../hooks/use-mention-search'
import { getOptions } from '../options'

export interface MentionPlaceholderProps {
  editor: Editable
  children: React.ReactElement
}

export const MentionPlaceholder = forwardRef<HTMLSpanElement, MentionPlaceholderProps>(
  ({ editor, children }, ref) => {
    const { placeholder } = useMemo(() => {
      return getOptions(editor)
    }, [editor])

    const searchValue = useMentionSearchValue(editor)
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
      <span tw="text-primary inline-block" ref={ref}>
        {renderChildren()}
      </span>
    )
  },
)

MentionPlaceholder.displayName = 'MentionPlaceholder'
