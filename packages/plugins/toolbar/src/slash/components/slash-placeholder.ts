import { Editable } from '@editablejs/editor'
import { useSlashToolbarSearchValue } from '../hooks/use-slash-toolbar-search'
import { getOptions } from '../options'
import { Ref, c, html, useMemo } from 'rezon'
import tw, { css } from 'twin.macro'
import { ref } from 'rezon/directives/ref'

export interface SlashToolbarPlaceholderProps {
  editor: Editable
  children: unknown
  ref?: Ref<HTMLSpanElement>
}

export const SlashToolbarPlaceholder = c<SlashToolbarPlaceholderProps>(
  ({ ref: refProp, editor, children }) => {
    const { placeholder } = useMemo(() => {
      return getOptions(editor)
    }, [editor])

    const searchValue = useSlashToolbarSearchValue(editor)
    const renderChildren = () => {
      if (searchValue) return children
      if (typeof placeholder === 'function') return placeholder(children)
      if (typeof placeholder === 'string')
        return [children, html`<span class=${css(tw`text-gray-300 opacity-80`)}>${placeholder}</span>`];

      return children
    }

    return html`<span ref=${ref(refProp)} class=${css(tw`inline-block`)}>${renderChildren()}</span>`
  },
)

