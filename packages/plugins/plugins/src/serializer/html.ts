import { HTMLSerializer } from '@editablejs/serializer/html'
import { withMarkHTMLSerializerTransform } from '@editablejs/plugin-mark/serializer/html'
import { withFontSizeHTMLSerializerTransform } from '@editablejs/plugin-font/size/serializer/html'
import { withFontColorHTMLSerializerTransform } from '@editablejs/plugin-font/color/serializer/html'
import { withBackgroundColorHTMLSerializerTransform } from '@editablejs/plugin-font/background-color/serializer/html'
import { withHeadingHTMLSerializerTransform } from '@editablejs/plugin-heading/serializer/html'
import { withBlockquoteHTMLSerializerTransform } from '@editablejs/plugin-blockquote/serializer/html'
import { withIndentHTMLSerializerTransform } from '@editablejs/plugin-indent/serializer/html'
import {
  withOrderedListHTMLSerializerTransform,
  withTaskListHTMLSerializerTransform,
  withUnorderedListHTMLSerializerTransform,
} from '@editablejs/plugin-list/serializer/html'
import {
  withTableCellHTMLSerializerTransform,
  withTableRowHTMLSerializerTransform,
  withTableHTMLSerializerTransform,
} from '@editablejs/plugin-table/serializer/html'
import { withLinkHTMLSerializerTransform } from '@editablejs/plugin-link/serializer/html'
import { withImageHTMLSerializerTransform } from '@editablejs/plugin-image/serializer/html'
import { withHrHTMLSerializerTransform } from '@editablejs/plugin-hr/serializer/html'
import { withAlignHTMLSerializerTransform } from '@editablejs/plugin-alignment/serializer/html'
import { withLeadingHTMLSerializerTransform } from '@editablejs/plugin-leading/serializer/html'
import { withMentionHTMLSerializerTransform } from '@editablejs/plugin-mention/serializer/html'
import { withCodeBlockHTMLSerializerTransform } from '@editablejs/plugin-codeblock/serializer/html'
import { Editor } from '@editablejs/models'

export const withHTMLSerializerTransform = (editor: Editor) => {
  const { withEditor } = HTMLSerializer
  withEditor(editor, withTableHTMLSerializerTransform, {})
  withEditor(editor, withTableRowHTMLSerializerTransform, {})
  withEditor(editor, withTableCellHTMLSerializerTransform, {})
  withEditor(editor, withBlockquoteHTMLSerializerTransform, {})
  withEditor(editor, withUnorderedListHTMLSerializerTransform, { editor })
  withEditor(editor, withTaskListHTMLSerializerTransform, {})
  withEditor(editor, withOrderedListHTMLSerializerTransform, { editor })
  withEditor(editor, withHeadingHTMLSerializerTransform, {})
  withEditor(editor, withFontSizeHTMLSerializerTransform, {})
  withEditor(editor, withFontColorHTMLSerializerTransform, {})
  withEditor(editor, withBackgroundColorHTMLSerializerTransform, {})
  withEditor(editor, withMarkHTMLSerializerTransform, {})
  withEditor(editor, withIndentHTMLSerializerTransform, {})
  withEditor(editor, withLinkHTMLSerializerTransform, {})
  withEditor(editor, withImageHTMLSerializerTransform, {})
  withEditor(editor, withHrHTMLSerializerTransform, {})
  withEditor(editor, withAlignHTMLSerializerTransform, {})
  withEditor(editor, withLeadingHTMLSerializerTransform, {})
  withEditor(editor, withMentionHTMLSerializerTransform, { editor })
  withEditor(editor, withCodeBlockHTMLSerializerTransform, { editor })
}
