import { Editor } from '@editablejs/models'
import { MENTION_KEY } from '../constants'
import { Mention, MentionUser } from '../interfaces/mention'
import { getOptions } from '../options'

export interface MentionEditor extends Editor {
  insertMention: <T = MentionUser>(user: T) => void
}

export const MentionEditor = {
  isMentionEditor: (editor: Editor): editor is MentionEditor => {
    return !!(editor as MentionEditor).insertMention
  },

  isMention: (editor: Editor, value: any): value is Mention => {
    return Mention.isMention(value)
  },

  queryActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    return elements[MENTION_KEY] ?? null
  },

  insert: <T = MentionUser>(editor: Editor, user: T) => {
    if (MentionEditor.isMentionEditor(editor)) editor.insertMention(user)
  },

  getOptions,
}
