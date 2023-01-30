import { Editable, HTMLSerializer, TextSerializer } from '@editablejs/editor'
import { withMarkHTMLTransform } from '@editablejs/plugin-mark/serializer'
import { withFontSizeHTMLTransform } from '@editablejs/plugin-font-size/serializer'
import { withFontColorHTMLTransform } from '@editablejs/plugin-font-color/serializer'
import { withBackgroundColorHTMLTransform } from '@editablejs/plugin-background-color/serializer'
import { withHeadingHTMLTransform } from '@editablejs/plugin-heading/serializer'
import {
  withBlockquoteHTMLTransform,
  withBlockquoteTextTransform,
} from '@editablejs/plugin-blockquote/serializer'
import { withIndentHTMLTransform } from '@editablejs/plugin-indent/serializer'
import {
  withOrderedListHTMLTransform,
  withTaskListHTMLTransform,
  withUnOrderedListHTMLTransform,
  withListTextTransform,
} from '@editablejs/plugin-list/serializer'
import {
  withTableCellHTMLTransform,
  withTableRowHTMLTransform,
  withTableHTMLTransform,
  withTableTextTransform,
} from '@editablejs/plugin-table/serializer'
import { withLinkHTMLTransform } from '@editablejs/plugin-link/serializer'
import { withImageHTMLTransform } from '@editablejs/plugin-image/serializer'
import { withHrHTMLTransform } from '@editablejs/plugin-hr/serializer'
import { withAlignHTMLTransform } from '@editablejs/plugin-align/serializer'
import { withLeadingHTMLTransform } from '@editablejs/plugin-leading/serializer'
import {
  withMentionTextTransform,
  withMentionHTMLTransform,
} from '@editablejs/plugin-mention/serializer'
import { withCodeBlockHTMLTransform } from '@editablejs/plugin-codeblock/serializer'

export const withHTMLSerializer = (editor: Editable) => {
  HTMLSerializer.with(withTableHTMLTransform, {})
  HTMLSerializer.with(withTableRowHTMLTransform, {})
  HTMLSerializer.with(withTableCellHTMLTransform, {})
  HTMLSerializer.with(withBlockquoteHTMLTransform, {})
  HTMLSerializer.with(withUnOrderedListHTMLTransform, { editor })
  HTMLSerializer.with(withTaskListHTMLTransform, {})
  HTMLSerializer.with(withOrderedListHTMLTransform, { editor })
  HTMLSerializer.with(withHeadingHTMLTransform, {})
  HTMLSerializer.with(withFontSizeHTMLTransform, {})
  HTMLSerializer.with(withFontColorHTMLTransform, {})
  HTMLSerializer.with(withBackgroundColorHTMLTransform, {})
  HTMLSerializer.with(withMarkHTMLTransform, {})
  HTMLSerializer.with(withIndentHTMLTransform, {})
  HTMLSerializer.with(withLinkHTMLTransform, {})
  HTMLSerializer.with(withImageHTMLTransform, {})
  HTMLSerializer.with(withHrHTMLTransform, {})
  HTMLSerializer.with(withAlignHTMLTransform, {})
  HTMLSerializer.with(withLeadingHTMLTransform, {})
  HTMLSerializer.with(withMentionHTMLTransform, { editor })
  HTMLSerializer.with(withCodeBlockHTMLTransform, { editor })
}

export const withTextSerializer = (editor: Editable) => {
  TextSerializer.with(withTableTextTransform, {})
  TextSerializer.with(withListTextTransform, { editor })
  TextSerializer.with(withBlockquoteTextTransform, {})
  TextSerializer.with(withMentionTextTransform, { editor })
}
