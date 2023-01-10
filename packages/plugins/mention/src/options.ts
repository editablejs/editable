import { Editable } from '@editablejs/editor'
import React from 'react'
import { MentionUser } from './interfaces/mention'

export interface MentionOptions {
  triggerChar?: string
  debounceWait?: number
  debounceMaxWait?: number
  placeholder?: React.ReactNode | ((children: React.ReactElement) => React.ReactElement)
  onSearch?: (value: string) => Promise<MentionUser[]>
  onSearchRender?: (users: MentionUser[]) => React.ReactElement
  onSearchRenderItem?: (user: MentionUser) => React.ReactNode
  onSearchRenderEmpty?: () => React.ReactNode
}

const MENTION_OPTIONS = new WeakMap<Editable, MentionOptions>()

export const getOptions = (editor: Editable): MentionOptions => {
  return MENTION_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editable, options: MentionOptions) => {
  MENTION_OPTIONS.set(editor, options)
}
