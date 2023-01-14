import { Editable, HTMLDeserializer } from '@editablejs/editor'
import { withMarkDescendantTransform } from '@editablejs/plugin-mark/deserializer'
import { withFontSizeDescendantTransform } from '@editablejs/plugin-font-size/deserializer'
import { withFontColorDescendantTransform } from '@editablejs/plugin-font-color/deserializer'
import { withBackgroundColorDescendantTransform } from '@editablejs/plugin-background-color/deserializer'
import { withHeadingDescendantTransform } from '@editablejs/plugin-heading/deserializer'
import { withBlockquoteDescendantTransform } from '@editablejs/plugin-blockquote/deserializer'
import { withIndentDescendantTransform } from '@editablejs/plugin-indent/deserializer'
import {
  withOrderedListDescendantTransform,
  withTaskListDescendantTransform,
  withUnOrderedListDescendantTransform,
} from '@editablejs/plugin-list/deserializer'
import {
  withTableCellDescendantTransform,
  withTableDescendantTransform,
  withTableRowDescendantTransform,
} from '@editablejs/plugin-table/deserializer'
import { withLinkDescendantTransform } from '@editablejs/plugin-link/deserializer'
import { withImageDescendantTransform } from '@editablejs/plugin-image/deserializer'
import { withHrDescendantTransform } from '@editablejs/plugin-hr/deserializer'
import { withAlignDescendantTransform } from '@editablejs/plugin-align/deserializer'
import { withLeadingDescendantTransform } from '@editablejs/plugin-leading/deserializer'
import { withMentionDescendantTransform } from '@editablejs/plugin-mention/deserializer'
import { withCodeBlockDescendantTransform } from '@editablejs/plugin-codeblock/deserializer'

export const withHTMLDeserializer = (editor: Editable) => {
  HTMLDeserializer.with(withTableDescendantTransform, { editor })
  HTMLDeserializer.with(withTableRowDescendantTransform, { editor })
  HTMLDeserializer.with(withTableCellDescendantTransform, {})
  HTMLDeserializer.with(withBlockquoteDescendantTransform, {})
  HTMLDeserializer.with(withUnOrderedListDescendantTransform, { editor })
  HTMLDeserializer.with(withTaskListDescendantTransform, { editor })
  HTMLDeserializer.with(withOrderedListDescendantTransform, { editor })
  HTMLDeserializer.with(withHeadingDescendantTransform, { editor })
  HTMLDeserializer.with(withFontSizeDescendantTransform, {})
  HTMLDeserializer.with(withFontColorDescendantTransform, {})
  HTMLDeserializer.with(withBackgroundColorDescendantTransform, {})
  HTMLDeserializer.with(withMarkDescendantTransform, {})
  HTMLDeserializer.with(withIndentDescendantTransform, {})
  HTMLDeserializer.with(withLinkDescendantTransform, {})
  HTMLDeserializer.with(withImageDescendantTransform, { editor })
  HTMLDeserializer.with(withHrDescendantTransform, {})
  HTMLDeserializer.with(withAlignDescendantTransform, {})
  HTMLDeserializer.with(withLeadingDescendantTransform, {})
  HTMLDeserializer.with(withMentionDescendantTransform, {})
  HTMLDeserializer.with(withCodeBlockDescendantTransform, {})
}
