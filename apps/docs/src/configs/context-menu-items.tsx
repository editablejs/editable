import { Editable, Grid, Hotkey, Range } from '@editablejs/editor'
import { ContextMenuItem } from '@editablejs/plugins'
import { Icon } from '@editablejs/ui'

export const createContextMenuItems = (editor: Editable) => {
  const { selection } = editor
  const isDisabled = !selection || Range.isCollapsed(selection)

  const items: ContextMenuItem[] = [
    {
      key: 'cut',
      icon: <Icon name="cut" />,
      title: '剪切',
      rightText: Hotkey.format('mod+x'),
      disabled: isDisabled,
      onSelect() {
        editor.cut()
      },
    },
    {
      key: 'copy',
      icon: <Icon name="copy" />,
      title: '复制',
      rightText: Hotkey.format('mod+c'),
      disabled: isDisabled,
      onSelect() {
        editor.copy()
      },
    },
    {
      key: 'paste',
      icon: <Icon name="paste" />,
      title: '粘贴',
      rightText: Hotkey.format('mod+v'),
      disabled: !selection,
      onSelect() {
        editor.insertFromClipboard()
      },
    },
    {
      key: 'pasteText',
      icon: <Icon name="pasteText" />,
      title: '粘贴为纯文本',
      rightText: Hotkey.format('mod+shift+v'),
      disabled: !selection,
      onSelect() {
        editor.insertTextFromClipboard()
      },
    },
  ]
  const grid = Grid.find(editor)
  if (grid) {
    items.push(
      {
        type: 'separator',
      },
      {
        key: 'tableMerge',
        icon: <Icon name="tableMerge" />,
        title: '合并单元格',
        disabled: !Grid.canMerge(editor, grid),
        onSelect: () => {
          Grid.mergeCell(editor, grid)
        },
      },
      {
        key: 'tableSplit',
        icon: <Icon name="tableSplit" />,
        title: '拆分单元格',
        disabled: !Grid.canSplit(editor, grid),
        onSelect: () => {
          Grid.splitCell(editor, grid)
        },
      },
    )
  }

  return items
}
