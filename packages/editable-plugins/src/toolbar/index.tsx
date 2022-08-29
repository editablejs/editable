import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Editable, useEditable } from '@editablejs/editable-editor';
import ToolbarGroup, { GroupItem } from './group';
import { ToolbarButton } from './button';
import { ToolbarDropdown } from './dropdown';
import './style.less';

export type ToolbarItem = ToolbarButton | ToolbarDropdown;
export interface ToolbarProps {
  items: ToolbarItem[][];
}

const getActiveState = (
  editor: Editable,
  items: ToolbarItem[][]
): GroupItem[][] => {
  return items.map((group) =>
    group.map((item) => {
      const { type, onActive } = item;
      switch (type) {
        case 'button':
          const { onDisabled } = item;
          return {
            ...item,
            active: onActive ? onActive(editor) : false,
            disabled: onDisabled ? onDisabled(editor) : false,
          };
        case 'dropdown':
          return { ...item, activeKey: onActive ? onActive(editor) : '' };
      }
    })
  );
};

const Toolbar: React.FC<
  ToolbarProps & React.HTMLAttributes<HTMLDivElement>
> = ({ items: itemProps, className, ...props }) => {
  const editor = useEditable();

  const [items, setItems] = useState<GroupItem[][]>(
    getActiveState(editor, itemProps)
  );

  useEffect(() => {
    const { onSelectionChange } = editor;
    editor.onSelectionChange = () => {
      onSelectionChange();
      setItems((items) => {
        return getActiveState(editor, items);
      });
    };
  }, [editor]);

  return (
    <div className={classNames('editable-toolbar', className)} {...props}>
      {items.map((group, index) => (
        <ToolbarGroup key={index} editor={editor} items={group} />
      ))}
    </div>
  );
};

export default Toolbar;
