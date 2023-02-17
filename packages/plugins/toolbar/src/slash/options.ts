import { Editable } from '@editablejs/editor'
import { Path, Node } from '@editablejs/models'
import { SlashToolbarItem } from './store'

export type SlashHotkey = string | string[] | ((e: KeyboardEvent) => boolean)

export interface SlashToolbarOptions {
  hotkey?: SlashHotkey
  debounceWait?: number
  debounceMaxWait?: number
  placeholder?: React.ReactNode | ((children: React.ReactElement) => React.ReactElement)
  onSearch?: (value: string) => Promise<SlashToolbarItem[]>
  onSearchRender?: (items: SlashToolbarItem[]) => React.ReactElement
  onSearchRenderItem?: (item: SlashToolbarItem) => React.ReactNode
  onSearchRenderEmpty?: () => React.ReactNode

  match?: (node: Node, path: Path) => boolean
}

export const SLASH_TOOLBAR_OPTIONS = new WeakMap<Editable, SlashToolbarOptions>()

export const getOptions = (editable: Editable): SlashToolbarOptions => {
  return SLASH_TOOLBAR_OPTIONS.get(editable) || {}
}

export const setOptions = (editable: Editable, options: SlashToolbarOptions): void => {
  SLASH_TOOLBAR_OPTIONS.set(editable, options)
}
