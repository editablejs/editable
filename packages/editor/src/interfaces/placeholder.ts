import { DOMNode } from '@/dom-utils';
import { Editor, Node, NodeEntry, Path, Range } from '@/interfaces';
import { Readonly } from './readonly';

export type PlaceholderRender = (node: Node) => DOMNode | null;

export interface PlaceholderListener {
  match: (node: Node, path: Path) => boolean;
  render: PlaceholderRender;
  exclusive?: boolean;
}

const EDITOR_TO_PLACEHOLDER_LISTENERS = new WeakMap<Editor, PlaceholderListener[]>();

const getOrCreatePlaceholderListeners = (editor: Editor) => {
  let listeners = EDITOR_TO_PLACEHOLDER_LISTENERS.get(editor);
  if (!listeners) {
    listeners = []
    EDITOR_TO_PLACEHOLDER_LISTENERS.set(editor, listeners);
  }
  return listeners;
};

export interface PlaceholderInterface {
  subscriber: (editor: Editor, match: (node: Node, path: Path) => boolean, render: PlaceholderRender, exclusive?: boolean) => Function;
  match: (editor: Editor, entry: NodeEntry) => ((node: Node, path: Path) => DOMNode | null)[];
  refresh: (editor: Editor) => void;
}

export const Placeholder: PlaceholderInterface = {
  subscriber: (editor, match, render, exclusive = false) => {
    const listeners = getOrCreatePlaceholderListeners(editor);
    const listener = { match, render, exclusive };
    listeners.push(listener);
    return () => {
      const index = listeners.findIndex(l => l === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  },

  match: (editor, entry) => {
    const listeners = getOrCreatePlaceholderListeners(editor).sort((a, b) => {
      if (a.exclusive && !b.exclusive) return -1;
      if (!a.exclusive && b.exclusive) return 1;
      return 0;
    })
    const [node, path] = entry;
    const renders = [];
    for (const listener of listeners) {
      if (listener.match(node, path)) {
        renders.push(listener.render);
        if (listener.exclusive) break;
      }
    }
    return renders;
  },

  refresh: (editor) => {
    const readonly = Readonly.isReadonly(editor);
    const listeners = getOrCreatePlaceholderListeners(editor);
    // if (readonly) {
    //   store.setState({ actives: [] });
    // } else if (Editor.isEmpty(editor, editor)) {
    //   Placeholder.update(editor, [editor, []]);
    // } else if (editor.selection && Range.isCollapsed(editor.selection)) {
    //   const nodes = Editor.nodes(editor, {
    //     at: editor.selection,
    //   });
    //   for (const entry of nodes) {
    //     if (Editor.isEmpty(editor, entry[0])) {
    //       return Placeholder.update(editor, entry);
    //     }
    //   }
    //   store.setState(({ actives }) => ({
    //     actives: actives.filter(d => {
    //       if (!d.alone) return false;
    //       return Editor.isEmpty(editor, d.entry[0]);
    //     }),
    //   }));
    // } else {
    //   store.setState(({ actives }) => ({
    //     actives: actives.filter(d => d.alone),
    //   }));
    // }
  },
};
