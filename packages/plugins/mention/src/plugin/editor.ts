import { Editable } from '@editablejs/editor'
import { MENTION_KEY } from '../constants'
import { Mention, MentionUser } from '../interfaces/mention'
import { getOptions } from '../options'

export interface MentionEditor extends Editable {
  insertMention: <T = MentionUser>(user: T) => void
}

export const MentionEditor = {
  isMentionEditor: (editor: Editable): editor is MentionEditor => {
    return !!(editor as MentionEditor).insertMention
  },

  isMention: (editor: Editable, value: any): value is Mention => {
    return Mention.isMention(value)
  },

  queryActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    return elements[MENTION_KEY] ?? null
  },

  insert: (editor: Editable, size: string) => {
    if (MentionEditor.isMentionEditor(editor)) editor.insertMention(size)
  },

  getOptions,
}
