import { Editable } from '@editablejs/editor'

export interface BaseEditor extends Editable {}

export const BaseEditor = {}

export const withBase = <T extends Editable>(editor: T) => {
  const newEditor = editor as T & BaseEditor

  const { onContextMenu } = newEditor

  newEditor.onContextMenu = (e: MouseEvent, items) => {
    items.push(
      {
        key: 'cut',
        title: '剪切',
        sort: 0,
      },
      {
        key: 'copy',
        title: '复制',
        sort: 0,
      },
      {
        key: 'paste',
        title: '粘贴',
        sort: 0,
      },
    )
    return onContextMenu(e, items)
  }

  return newEditor
}
