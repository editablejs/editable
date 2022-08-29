import React from 'react';
import {
  Editable,
  ElementAttributes,
  isHotkey,
  RenderElementProps,
  Transforms,
  Node,
} from '@editablejs/editable-editor';
import { List, ListEditor, ToggleListOptions, withList } from './base';
import './task.less';

type Hotkey = string | ((e: KeyboardEvent) => boolean);

const TASK_LIST_KEY = 'task-list';

const DATA_TASK_CHECKED_KEY = 'data-task-checked';

const defaultHotkey: Hotkey = 'mod+shift+9';

export interface TaskListOptions {
  hotkey?: Hotkey;
}

export interface Task extends List {
  type: typeof TASK_LIST_KEY;
  checked?: boolean;
}

export interface ToggleTaskListOptions
  extends Omit<ToggleListOptions, 'start' | 'values'> {
  checked?: boolean;
}

export interface TaskListEditor extends Editable {
  toggleTaskList: (options?: ToggleTaskListOptions) => void;
}

export const TaskListEditor = {
  isListEditor: (editor: Editable): editor is TaskListEditor => {
    return !!(editor as TaskListEditor).toggleTaskList;
  },

  isTask: (editor: Editable, n: Node): n is Task => {
    return (
      ListEditor.isList(editor, n, TASK_LIST_KEY) && n.type === TASK_LIST_KEY
    );
  },

  queryActive: (editor: Editable) => {
    return ListEditor.queryActive(editor, TASK_LIST_KEY);
  },

  toggle: (editor: TaskListEditor, options?: ToggleTaskListOptions) => {
    editor.toggleTaskList(options);
  },
};

const prefixCls = 'editable-task-list';

interface TaskProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface RenderTaskElementProps extends RenderElementProps {
  attributes: ElementAttributes &
    Partial<Record<typeof DATA_TASK_CHECKED_KEY, boolean>>;
}

const TaskElement = ({ checked, onChange }: TaskProps) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <span
      onMouseDown={handleMouseDown}
      onClick={() => onChange(!checked)}
      className={`${prefixCls}-checkbox`}
    >
      <span className={`${prefixCls}-inner`}></span>
    </span>
  );
};

export const withTaskList = <T extends Editable>(
  editor: T,
  options: TaskListOptions = {}
) => {
  const hotkey = options.hotkey || defaultHotkey;

  const e = editor as T & TaskListEditor;

  const newEditor = withList(e, TASK_LIST_KEY);

  const { renderElement } = newEditor;

  newEditor.renderElement = (props: RenderTaskElementProps) => {
    const { element, attributes, children } = props;
    if (TaskListEditor.isTask(newEditor, element)) {
      attributes[DATA_TASK_CHECKED_KEY] = element.checked ?? false;
      return ListEditor.render(newEditor, {
        props: {
          element,
          attributes,
          children,
        },
        className: prefixCls,
        onRenderLabel: (element) => {
          const { checked } = element as Task;
          const onChange = (checked: boolean) => {
            Transforms.setNodes<Task>(
              editor,
              { checked },
              { at: Editable.findPath(editor, element) }
            );
          };
          return <TaskElement checked={checked ?? false} onChange={onChange} />;
        },
      });
    }
    return renderElement(props);
  };

  newEditor.toggleTaskList = (options?: ToggleTaskListOptions) => {
    ListEditor.toggle(editor, TASK_LIST_KEY, {
      ...options,
      values: {
        checked: options?.checked ?? false,
      },
    });
  };

  const { onKeydown } = newEditor;

  newEditor.onKeydown = (e: KeyboardEvent) => {
    const toggle = () => {
      e.preventDefault();
      newEditor.toggleTaskList();
    };
    if (
      (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      toggle();
      return;
    }
    onKeydown(e);
  };

  return newEditor;
};
