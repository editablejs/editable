import { Editor, Node, Path } from '@editablejs/models'
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
  match?: (node: Node, path: Path) => boolean
}

const MENTION_OPTIONS = new WeakMap<Editor, MentionOptions>()

export const getOptions = (editor: Editor): MentionOptions => {
  return MENTION_OPTIONS.get(editor) ?? {}
}

export const setOptions = (editor: Editor, options: MentionOptions) => {
  MENTION_OPTIONS.set(editor, options)
}
