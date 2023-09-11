// placeholder.ts

import { DOMNode, Editor, Node, NodeEntry, Range } from '@editablejs/models';
import { Editable } from './editable';
import { StoreApi, createStore } from '../store';
import { Readonly } from './readonly';

export interface RenderPlaceholderProps {
  node: Node;
}
export type PlaceholderRender = (props: RenderPlaceholderProps) => DOMNode | null;

export type PlaceholderSubscribe = (entry: NodeEntry) => PlaceholderRender | void;

interface ActivePlaceholder {
  entry: NodeEntry;
  alone: boolean;
  render: PlaceholderRender;
  placeholder: PlaceholderSubscribe;
}

export interface PlaceholderStore {
  placeholders: PlaceholderSubscribe[];
  actives: ActivePlaceholder[];
}

const DEFAULT_PLACEHOLDER_STORE_STATE: PlaceholderStore = {
  placeholders: [],
  actives: [],
};

const ALONE_PLACEHOLDER_FLAG = new WeakMap<PlaceholderSubscribe, boolean>();

const EDITOR_TO_PLACEHOLDER_STORE = new WeakMap<Editable, StoreApi<PlaceholderStore>>();

const getOrCreatePlaceholderStore = (editor: Editable) => {
  let store = EDITOR_TO_PLACEHOLDER_STORE.get(editor);
  if (!store) {
    store = createStore<PlaceholderStore>(() => DEFAULT_PLACEHOLDER_STORE_STATE);
    EDITOR_TO_PLACEHOLDER_STORE.set(editor, store);
  }
  return store;
};

export const Placeholder = {
  getState: (editor: Editable) => {
    const store = getOrCreatePlaceholderStore(editor);
    return store.getState();
  },

  setState: (editor: Editable, state: Partial<PlaceholderStore>) => {
    const store = getOrCreatePlaceholderStore(editor);
    store.setState(state);
  },

  subscribe: (editor: Editable, fn: PlaceholderSubscribe, alone = false) => {
    const store = getOrCreatePlaceholderStore(editor);
    ALONE_PLACEHOLDER_FLAG.set(fn, alone);

    store.setState(state => ({
      placeholders: [...state.placeholders.filter(d => d !== fn), fn],
    }));

    return () => {
      store.setState(state => ({
        placeholders: state.placeholders.filter(d => d !== fn),
      }));
      ALONE_PLACEHOLDER_FLAG.delete(fn);
    };
  },

  getActiveRender: (editor: Editable, node: Node) => {
    const { actives } = Placeholder.getState(editor)

    return actives.find(d => d.entry[0] === node)?.render
  },

  isAlone: (fn: PlaceholderSubscribe) => {
    return ALONE_PLACEHOLDER_FLAG.get(fn) ?? false;
  },

  update: (editor: Editable, entry: NodeEntry) => {
    const store = getOrCreatePlaceholderStore(editor);
    const state = store.getState();
    let render: PlaceholderRender | null = null;
    let placeholder: PlaceholderSubscribe | null = null;
    const aloneActive = state.actives.find(d => d.alone && d.entry[0] === entry[0]);
    if (aloneActive) {
      const r = aloneActive.placeholder(entry)
      if (r) {
        render = r;
        placeholder = aloneActive.placeholder;
      }
    } else {
      const hasEditorPlaceholder = state.actives.some(d => d.entry[0] === editor);
      const placeholders = state.placeholders.sort(a => (Placeholder.isAlone(a) ? 1 : 0));
      for (let i = placeholders.length - 1; i >= 0; i--) {
        placeholder = placeholders[i];
        if (!Placeholder.isAlone(placeholder) && hasEditorPlaceholder) continue;
        const r = placeholder(entry)
        if (r) {
          render = r;
          break;
        }
      }
    }

    const actives = state.actives.filter(d => {
      if (!d.alone || (d.entry[0] === entry[0] && render)) return false;
      return Editor.isEmpty(editor, d.entry[0]);
    });

    if (render && placeholder) {
      actives.push({
        entry,
        alone: Placeholder.isAlone(placeholder),
        render,
        placeholder,
      });
    }
    store.setState({ actives });
    return render;
  },

  refresh: (editor: Editable) => {
    const readonly = Readonly.getState(editor);
    const store = getOrCreatePlaceholderStore(editor);
    if (readonly) {
      store.setState({ actives: [] });
    } else if (Editor.isEmpty(editor, editor)) {
      Placeholder.update(editor, [editor, []]);
    } else if (editor.selection && Range.isCollapsed(editor.selection)) {
      const nodes = Editor.nodes(editor, {
        at: editor.selection,
      });
      for (const entry of nodes) {
        if (Editor.isEmpty(editor, entry[0])) {
          return Placeholder.update(editor, entry);
        }
      }
      store.setState(({ actives }) => ({
        actives: actives.filter(d => {
          if (!d.alone) return false;
          return Editor.isEmpty(editor, d.entry[0]);
        }),
      }));
    } else {
      store.setState(({ actives }) => ({
        actives: actives.filter(d => d.alone),
      }));
    }
  },
};
