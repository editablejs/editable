import { Editable } from '@editablejs/editor'
import React from 'react'

export interface MentionOptions {
  triggerChar?: string
  placeholder?: React.ReactNode | ((children: React.ReactElement) => React.ReactElement)
}

const MENTION_OPTIONS = new WeakMap<Editable, MentionOptions>()

export const getOptions = (editor: Editable): MentionOptions => {
  return MENTION_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: MentionOptions) => {
  MENTION_OPTIONS.set(editor, options)
}
