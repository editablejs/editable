import { HTMLDeserializer } from '@editablejs/deserializer/html'
import { withMarkHTMLDeserializerTransform } from '@editablejs/plugin-mark/deserializer/html'
import { withFontSizeHTMLDeserializerTransform } from '@editablejs/plugin-font/size/deserializer/html'
import { withFontColorHTMLDeserializerTransform } from '@editablejs/plugin-font/color/deserializer/html'
import { withBackgroundColorHTMLDeserializerTransform } from '@editablejs/plugin-font/background-color/deserializer/html'
import { withHeadingHTMLDeserializerTransform } from '@editablejs/plugin-heading/deserializer/html'
import { withBlockquoteHTMLDeserializerTransform } from '@editablejs/plugin-blockquote/deserializer/html'
import { withIndentHTMLDeserializerTransform } from '@editablejs/plugin-indent/deserializer/html'
import {
  withOrderedListHTMLDeserializerTransform,
  withTaskListHTMLDeserializerTransform,
  withUnorderedListHTMLDeserializerTransform,
} from '@editablejs/plugin-list/deserializer/html'
import {
  withTableCellHTMLDeserializerTransform,
  withTableHTMLDeserializerTransform,
  withTableRowHTMLDeserializerTransform,
} from '@editablejs/plugin-table/deserializer/html'
import { withLinkHTMLDeserializerTransform } from '@editablejs/plugin-link/deserializer/html'
import { withImageHTMLDeserializerTransform } from '@editablejs/plugin-image/deserializer/html'
import { withHrHTMLDeserializerTransform } from '@editablejs/plugin-hr/deserializer/html'
import { withAlignHTMLDeserializerTransform } from '@editablejs/plugin-alignment/deserializer/html'
import { withLeadingHTMLDeserializerTransform } from '@editablejs/plugin-leading/deserializer/html'
import { withMentionHTMLDeserializerTransform } from '@editablejs/plugin-mention/deserializer/html'
import { withCodeBlockHTMLDeserializerTransform } from '@editablejs/plugin-codeblock/deserializer/html'
import { Editor } from '@editablejs/models'

export const withHTMLDeserializerTransform = (editor: Editor) => {
  const { withEditor } = HTMLDeserializer
  withEditor(editor, withTableHTMLDeserializerTransform, { editor })
  withEditor(editor, withTableRowHTMLDeserializerTransform, { editor })
  withEditor(editor, withTableCellHTMLDeserializerTransform, {})
  withEditor(editor, withBlockquoteHTMLDeserializerTransform, {})
  withEditor(editor, withUnorderedListHTMLDeserializerTransform, { editor })
  withEditor(editor, withTaskListHTMLDeserializerTransform, { editor })
  withEditor(editor, withOrderedListHTMLDeserializerTransform, { editor })
  withEditor(editor, withHeadingHTMLDeserializerTransform, { editor })
  withEditor(editor, withFontSizeHTMLDeserializerTransform, {})
  withEditor(editor, withFontColorHTMLDeserializerTransform, {})
  withEditor(editor, withBackgroundColorHTMLDeserializerTransform, {})
  withEditor(editor, withMarkHTMLDeserializerTransform, {})
  withEditor(editor, withIndentHTMLDeserializerTransform, {})
  withEditor(editor, withLinkHTMLDeserializerTransform, {})
  withEditor(editor, withImageHTMLDeserializerTransform, { editor })
  withEditor(editor, withHrHTMLDeserializerTransform, {})
  withEditor(editor, withAlignHTMLDeserializerTransform, {})
  withEditor(editor, withLeadingHTMLDeserializerTransform, {})
  withEditor(editor, withMentionHTMLDeserializerTransform, {})
  withEditor(editor, withCodeBlockHTMLDeserializerTransform, {})
}
