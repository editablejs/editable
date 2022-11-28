import { Locale } from '@editablejs/editor'

export interface SideToolbarLocale extends Locale {
  sideToolbar: {
    actionClick: string
    actionDrag: string
    openMenu: string
    dragDrop: string
  }
}
