import React, { CSSProperties } from 'react';
import {
  Editable,
  RenderLeafProps,
  isHotkey,
  Editor,
  Text,
} from '@editablejs/editable-editor';
import './mark.less';

type Hotkeys = Record<MarkFormat, string | ((e: KeyboardEvent) => boolean)>;
export interface MarkOptions {
  enabled?: MarkFormat[];
  disabled?: MarkFormat[];
  hotkeys?: Hotkeys;
}

export const MARK_OPTIONS = new WeakMap<Editable, MarkOptions>();

export type MarkFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'sub'
  | 'sup';

const defaultHotkeys: Hotkeys = {
  bold: 'mod+b',
  italic: 'mod+i',
  underline: 'mod+u',
  strikethrough: 'mod+shift+x',
  code: 'mod+e',
  sub: 'mod+,',
  sup: 'mod+.',
};

export interface Mark extends Text {
  bold?: string | boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  sup?: boolean;
  sub?: boolean;
}
export interface MarkEditor extends Editable {
  toggleMark: (format: MarkFormat) => void;
}

export const MarkEditor = {
  isMarkEditor: (editor: Editable): editor is MarkEditor => {
    return !!(editor as MarkEditor).toggleMark;
  },

  isMark: (node: Text): node is Mark => {
    return Text.isText(node);
  },

  isActive: (editor: Editable, format: MarkFormat) => {
    if (!MarkEditor.isEnabled(editor, format)) return false;
    const marks = editor.queryActiveMarks<Mark>();
    return !!marks[format];
  },

  isEnabled: (editor: Editable, format: MarkFormat) => {
    if (!MarkEditor.isMarkEditor(editor)) return false;
    const { enabled, disabled } = MarkEditor.getOptions(editor);
    if (enabled && ~~enabled.indexOf(format)) return false;
    if (disabled && ~disabled.indexOf(format)) return false;
    return true;
  },

  toggle: (editor: MarkEditor, format: MarkFormat) => {
    editor.toggleMark(format);
  },

  getOptions: (editor: Editable): MarkOptions => {
    return MARK_OPTIONS.get(editor) ?? {};
  },
};

export const withMark = <T extends Editable>(
  editor: T,
  options: MarkOptions = {}
) => {
  const newEditor = editor as T & MarkEditor;

  MARK_OPTIONS.set(newEditor, options);

  const { renderLeaf } = newEditor;

  newEditor.toggleMark = (format: MarkFormat) => {
    if (!MarkEditor.isEnabled(editor, format)) return;
    const active = MarkEditor.isActive(editor, format);

    newEditor.normalizeSelection((selection) => {
      if (newEditor.selection !== selection) newEditor.selection = selection;

      if (active) {
        Editor.removeMark(newEditor, format);
      } else {
        if (format === 'sub') {
          Editor.removeMark(newEditor, 'sup');
        } else if (format === 'sup') {
          Editor.removeMark(newEditor, 'sub');
        }
        Editor.addMark(newEditor, format, true);
      }
    });
  };

  newEditor.renderLeaf = ({
    attributes,
    children,
    text,
  }: RenderLeafProps<Mark>) => {
    const style: CSSProperties = attributes.style ?? {};
    if (text.bold && MarkEditor.isEnabled(editor, 'bold')) {
      style.fontWeight = typeof text.bold === 'string' ? text.bold : 'bold';
    } else {
      style.fontWeight = 'normal';
    }

    if (text.italic && MarkEditor.isEnabled(editor, 'italic')) {
      style.fontStyle = 'italic';
    }

    if (text.underline && MarkEditor.isEnabled(editor, 'underline')) {
      style.textDecoration = 'underline';
    }

    if (text.strikethrough && MarkEditor.isEnabled(editor, 'strikethrough')) {
      style.textDecoration = style.textDecoration
        ? style.textDecoration + ' line-through'
        : 'line-through';
    }

    const enabledSub = text.sub && MarkEditor.isEnabled(editor, 'sub');
    if (enabledSub) {
      children = <span className="editable-sub">{children}</span>;
    }
    const enabledSup = text.sup && MarkEditor.isEnabled(editor, 'sup');
    if (enabledSup) {
      children = <span className="editable-sup">{children}</span>;
    }

    if (text.code && MarkEditor.isEnabled(editor, 'code')) {
      children = <code className="editable-code">{children}</code>;
    }

    return renderLeaf({
      attributes: Object.assign({}, attributes, { style }),
      children,
      text,
    });
  };

  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys);

  const { onKeydown } = newEditor;
  newEditor.onKeydown = (e: KeyboardEvent) => {
    for (const key in hotkeys) {
      const format = key as MarkFormat;
      const hotkey = hotkeys[format];
      const toggle = () => {
        e.preventDefault();
        newEditor.toggleMark(format);
      };
      if (
        (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
        (typeof hotkey === 'function' && hotkey(e))
      ) {
        toggle();
        return;
      }
    }
    onKeydown(e);
  };

  return newEditor;
};
