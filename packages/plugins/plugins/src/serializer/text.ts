import { Editor } from '@editablejs/models'
import { withBlockquoteTextSerializerTransform } from '@editablejs/plugin-blockquote/serializer/text'
import { withListTextSerializerTransform } from '@editablejs/plugin-list/serializer/text'
import { withTableTextSerializerTransform } from '@editablejs/plugin-table/serializer/text'
import { withMentionTextSerializerTransform } from '@editablejs/plugin-mention/serializer/text'
import { TextSerializer } from '@editablejs/serializer/text'

export const withTextSerializerTransform = (editor: Editor) => {
  const { withEditor } = TextSerializer
  withEditor(editor, withTableTextSerializerTransform, {})
  withEditor(editor, withListTextSerializerTransform, { editor })
  withEditor(editor, withBlockquoteTextSerializerTransform, {})
  withEditor(editor, withMentionTextSerializerTransform, { editor })
}
