import { MarkdownSerializer } from '@editablejs/serializer/markdown'
import { Editor } from '@editablejs/models'
import {
  withMarkMarkdownSerializerTransform,
  withMarkMarkdownSerializerPlugin,
} from '@editablejs/plugin-mark/serializer/markdown'
import { withBlockquoteMarkdownSerializerTransform } from '@editablejs/plugin-blockquote/serializer/markdown'
import { withCodeBlockMarkdownSerializerTransform } from '@editablejs/plugin-codeblock/serializer/markdown'
import { withHeadingMarkdownSerializerTransform } from '@editablejs/plugin-heading/serializer/markdown'
import { withHrMarkdownSerializerTransform } from '@editablejs/plugin-hr/serializer/markdown'
import { withImageMarkdownSerializerTransform } from '@editablejs/plugin-image/serializer/markdown'
import {
  withLinkMarkdownSerializerPlugin,
  withLinkMarkdownSerializerTransform,
} from '@editablejs/plugin-link/serializer/markdown'
import {
  withOrderedListMarkdownSerializerTransform,
  withTaskListMarkdownSerializerPlugin,
  withTaskListMarkdownSerializerTransform,
  withUnorderedListMarkdownSerializerTransform,
} from '@editablejs/plugin-list/serializer/markdown'
import {
  withTableCellMarkdownSerializerTransform,
  withTableMarkdownSerializerPlugin,
  withTableMarkdownSerializerTransform,
  withTableRowMarkdownSerializerTransform,
} from '@editablejs/plugin-table/serializer/markdown'

export const withMarkdownSerializerTransform = (editor: Editor) => {
  const { withEditor } = MarkdownSerializer
  withEditor(editor, withTableCellMarkdownSerializerTransform, {})
  withEditor(editor, withTableRowMarkdownSerializerTransform, {})
  withEditor(editor, withTableMarkdownSerializerTransform, {})
  withEditor(editor, withTaskListMarkdownSerializerTransform, {})
  withEditor(editor, withOrderedListMarkdownSerializerTransform, {})
  withEditor(editor, withUnorderedListMarkdownSerializerTransform, {})
  withEditor(editor, withHrMarkdownSerializerTransform, {})
  withEditor(editor, withHeadingMarkdownSerializerTransform, {})
  withEditor(editor, withCodeBlockMarkdownSerializerTransform, {})
  withEditor(editor, withBlockquoteMarkdownSerializerTransform, {})
  withEditor(editor, withImageMarkdownSerializerTransform, {})
  withEditor(editor, withLinkMarkdownSerializerTransform, {})
  withEditor(editor, withMarkMarkdownSerializerTransform, {})
}

export const withMarkdownSerializerPlugin = (editor: Editor) => {
  const { withEditorPlugin } = MarkdownSerializer
  withEditorPlugin(editor, withTableMarkdownSerializerPlugin)
  withEditorPlugin(editor, withTaskListMarkdownSerializerPlugin)
  withEditorPlugin(editor, withLinkMarkdownSerializerPlugin)
  withEditorPlugin(editor, withMarkMarkdownSerializerPlugin)
}
