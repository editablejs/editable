import { Editable, Grid, Hotkey, Range } from '@editablejs/editor'
import { ContextMenuItem, ContextMenuStore, UI } from '@editablejs/plugins'

const { Icon } = UI

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
        editor.dispatchEvent('cut')
      },
    },
    {
      key: 'copu',
      icon: <Icon name="copy" />,
      title: '复制',
      rightText: Hotkey.format('mod+c'),
      disabled: isDisabled,
      onSelect() {
        editor.dispatchEvent('copy')
      },
    },
    {
      key: 'paste',
      icon: <Icon name="paste" />,
      title: '粘贴',
      rightText: Hotkey.format('mod+v'),
      disabled: !selection,
      onSelect() {
        editor.dispatchEvent('paste')
      },
    },
    {
      key: 'paste-text',
      icon: <Icon name="pasteText" />,
      title: '粘贴为纯文本',
      rightText: Hotkey.format('mod+shift+v'),
      disabled: !selection,
      onSelect() {
        editor.dispatchEvent('paste-text')
      },
    },
  ]
  const grid = Grid.findGrid(editor)
  if (grid) {
    items.push(
      {
        type: 'separator',
      },
      {
        key: 'merge_cells',
        icon: <Icon name="tableMerge" />,
        title: '合并单元格',
        disabled: !Grid.canMerge(editor, grid),
        onSelect: () => {
          Grid.mergeCell(editor, grid)
        },
      },
      {
        key: 'split_cells',
        icon: <Icon name="tableSplit" />,
        title: '拆分单元格',
        disabled: !Grid.canSplit(editor, grid),
        onSelect: () => {
          Grid.splitCell(editor, grid)
        },
      },
    )
  }

  ContextMenuStore.setItems(editor, items)
}
