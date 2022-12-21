import { Editable } from '@editablejs/editor'
import { LINK_KEY } from './constants'
import { Link } from './interfaces/link'
import { getOptions } from './options'

export interface LinkEditor extends Editable {
  openLink: () => void

  insertLink: (link: Partial<Omit<Link, 'type'>>) => void

  wrapLink: (link: Partial<Omit<Link, 'type' | 'children'>>) => void

  cancelLink: (link: Link) => void
}

export const LinkEditor = {
  isLinkEditor: (editor: Editable): editor is LinkEditor => {
    return !!(editor as LinkEditor).openLink
  },

  isLink: (editor: Editable, n: any): n is Link => {
    return Link.isLink(n)
  },

  isActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    return !!elements[LINK_KEY]
  },

  getOptions: (editor: Editable) => {
    return getOptions(editor)
  },

  open: (editor: Editable) => {
    if (LinkEditor.isLinkEditor(editor)) editor.openLink()
  },

  insert: (editor: Editable, link: Partial<Omit<Link, 'type'>>) => {
    if (LinkEditor.isLinkEditor(editor)) editor.insertLink(link)
  },

  wrap: (editor: Editable, link: Partial<Omit<Link, 'type' | 'children'>>) => {
    if (LinkEditor.isLinkEditor(editor)) editor.wrapLink(link)
  },

  cancel: (editor: Editable, link: Link) => {
    if (LinkEditor.isLinkEditor(editor)) editor.cancelLink(link)
  },
}
