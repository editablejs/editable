import { Editor } from '@editablejs/models'
import { LINK_KEY } from '../constants'
import { Link } from '../interfaces/link'
import { getOptions } from '../options'

export interface LinkEditor extends Editor {
  openLink: () => void

  insertLink: (link: Partial<Omit<Link, 'type'>>) => void

  wrapLink: (link: Partial<Omit<Link, 'type' | 'children'>>) => void

  cancelLink: (link: Link) => void
}

export const LinkEditor = {
  isLinkEditor: (editor: Editor): editor is LinkEditor => {
    return !!(editor as LinkEditor).openLink
  },

  isLink: (editor: Editor, n: any): n is Link => {
    return Link.isLink(n)
  },

  isActive: (editor: Editor) => {
    const elements = Editor.elements(editor)
    return !!elements[LINK_KEY]
  },

  getOptions,

  open: (editor: Editor) => {
    if (LinkEditor.isLinkEditor(editor)) editor.openLink()
  },

  insert: (editor: Editor, link: Partial<Omit<Link, 'type'>>) => {
    if (LinkEditor.isLinkEditor(editor)) editor.insertLink(link)
  },

  wrap: (editor: Editor, link: Partial<Omit<Link, 'type' | 'children'>>) => {
    if (LinkEditor.isLinkEditor(editor)) editor.wrapLink(link)
  },

  cancel: (editor: Editor, link: Link) => {
    if (LinkEditor.isLinkEditor(editor)) editor.cancelLink(link)
  },
}
