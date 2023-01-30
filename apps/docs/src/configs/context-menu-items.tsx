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
      title: 'Cut',
      rightText: Hotkey.format('mod+x'),
      disabled: isDisabled,
      onSelect() {
        editor.cut()
      },
    },
    {
      key: 'copy',
      icon: <Icon name="copy" />,
      title: 'Copy',
      rightText: Hotkey.format('mod+c'),
      disabled: isDisabled,
      onSelect() {
        editor.copy()
      },
    },
    {
      key: 'paste',
      icon: <Icon name="paste" />,
      title: 'Paste',
      rightText: Hotkey.format('mod+v'),
      disabled: !selection,
      onSelect() {
        editor.insertFromClipboard()
      },
    },
    {
      key: 'paste-text',
      icon: <Icon name="pasteText" />,
      title: 'Paste as plain text',
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
        key: 'merge_cells',
        icon: <Icon name="tableMerge" />,
        title: 'Merge cells',
        disabled: !Grid.canMerge(editor, grid),
        onSelect: () => {
          Grid.mergeCell(editor, grid)
        },
      },
      {
        key: 'split_cells',
        icon: <Icon name="tableSplit" />,
        title: 'Split cells',
        disabled: !Grid.canSplit(editor, grid),
        onSelect: () => {
          Grid.splitCell(editor, grid)
        },
      },
    )
  }

  return items
}
