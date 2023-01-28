import { Locale } from '@editablejs/editor'

export interface ContextMenuItems extends Locale {
  contextMenuItems: {
    cut: string
    copy: string
    paste: string
    pasteText: string
    tableMerge: string
    tableSplit: string
  }
}
