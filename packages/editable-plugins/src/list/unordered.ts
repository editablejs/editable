import { Editable, isHotkey } from '@editablejs/editable-editor';
import {
  List,
  ListEditor,
  ListTemplate,
  ToggleListOptions,
  withList,
} from './base';

type Hotkey = string | ((e: KeyboardEvent) => boolean);

const UNORDERED_LIST_KEY = 'unordered-list';

const defaultHotkey: Hotkey = 'mod+shift+8';

export interface UnOrderedListOptions {
  hotkey?: Hotkey;
}

export interface ToggleUnOrderedListOptions
  extends Omit<ToggleListOptions, 'start'> {}

export interface UnOrdered extends List {
  type: typeof UNORDERED_LIST_KEY;
}

export interface UnOrderedListEditor extends Editable {
  toggleUnOrderedList: (options?: ToggleUnOrderedListOptions) => void;
}

export const UnOrderedListEditor = {
  isListEditor: (editor: Editable): editor is UnOrderedListEditor => {
    return !!(editor as UnOrderedListEditor).toggleUnOrderedList;
  },

  isUnOrderedList: (editor: Editable, value: any): value is UnOrdered => {
    return value && value.type === UNORDERED_LIST_KEY;
  },

  queryActive: (editor: Editable) => {
    return ListEditor.queryActive(editor, UNORDERED_LIST_KEY);
  },

  toggle: (
    editor: UnOrderedListEditor,
    options?: ToggleUnOrderedListOptions
  ) => {
    editor.toggleUnOrderedList(options);
  },
};

const prefixCls = 'editable-unordered-list';

export const UnOrderedListTemplates: ListTemplate[] = [
  {
    key: 'default',
    depth: 3,
    render: ({ level }: List) => {
      const l = level % 3;
      switch (l) {
        case 1:
          return `○`;
        case 2:
          return `■`;
        default:
          return `●`;
      }
    },
  },
];

export const withUnOrderedList = <T extends Editable>(
  editor: T,
  options: UnOrderedListOptions = {}
) => {
  const hotkey = options.hotkey || defaultHotkey;

  const e = editor as T & UnOrderedListEditor;

  const newEditor = withList(e, UNORDERED_LIST_KEY);

  UnOrderedListTemplates.forEach((template) => {
    ListEditor.addTemplate(newEditor, UNORDERED_LIST_KEY, template);
  });

  const { renderElement } = newEditor;

  newEditor.renderElement = (props) => {
    const { element, attributes, children } = props;
    if (ListEditor.isList(newEditor, element, UNORDERED_LIST_KEY)) {
      return ListEditor.render(newEditor, {
        props: {
          element,
          attributes,
          children,
        },
        className: prefixCls,
      });
    }
    return renderElement(props);
  };

  newEditor.toggleUnOrderedList = (options?: ToggleUnOrderedListOptions) => {
    ListEditor.toggle(editor, UNORDERED_LIST_KEY, {
      ...options,
      template: options?.template ?? UnOrderedListTemplates[0].key,
    });
  };

  const { onKeydown } = newEditor;

  newEditor.onKeydown = (e: KeyboardEvent) => {
    const toggle = () => {
      e.preventDefault();
      newEditor.toggleUnOrderedList();
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
