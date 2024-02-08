import { Editable } from '@editablejs/editor'
import { Path, Node } from '@editablejs/models'
import { SlashToolbarItem } from './store'
import { Component } from 'rezon'

export type SlashHotkey = string | string[] | ((e: KeyboardEvent) => boolean)

export interface SlashToolbarOptions {
  hotkey?: SlashHotkey
  debounceWait?: number
  debounceMaxWait?: number
  placeholder?: unknown | (Component<{ children: unknown }>)
  onSearch?: (value: string) => Promise<SlashToolbarItem[]>
  onSearchRender?: (items: SlashToolbarItem[]) => unknown
  onSearchRenderItem?: (item: SlashToolbarItem) => unknown
  onSearchRenderEmpty?: () => unknown

  match?: (node: Node, path: Path) => boolean
}

export const SLASH_TOOLBAR_OPTIONS = new WeakMap<Editable, SlashToolbarOptions>()

export const getOptions = (editable: Editable): SlashToolbarOptions => {
  return SLASH_TOOLBAR_OPTIONS.get(editable) || {}
}

export const setOptions = (editable: Editable, options: SlashToolbarOptions): void => {
  SLASH_TOOLBAR_OPTIONS.set(editable, options)
}
