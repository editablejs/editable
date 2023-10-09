import {
  DOMElement,
  DOMNode,
  Editor,
  Element,
  Node,
  Path,
  Range,
  Text,
} from '@editablejs/models';
import { StoreApi, createStore } from '../store';

// Define interface for properties passed to the render function of a text decoration
export interface DecorateRenderProps<T = Node> {
  node: T;
  path: Path;
  children: DOMNode;
}

// Define BaseDecorate interface with a key property that is optional
export interface BaseDecorate {
  key?: string;
}

// Define TextDecorate interface with match and renderText functions
export interface TextDecorate extends BaseDecorate {
  match: (node: Text, path: Path) => Range[];
  renderText: (props: DecorateRenderProps<Text>) => HTMLElement;
}

// Define ElementDecorate interface with match and renderElement functions
export interface ElementDecorate extends BaseDecorate {
  match: (node: Element, path: Path) => boolean;
  renderElement: (props: DecorateRenderProps<Element>) => HTMLElement;
}

// Define a type for decorations which can either be a TextDecorate or an ElementDecorate
export type Decorate = TextDecorate | ElementDecorate;

// Define DecorateStore interface with decorations property
export interface DecorateStore {
  decorations: Decorate[];
}

// Define a constant for the decoration store
const EDITOR_TO_DECORATE_STORE = new WeakMap<Editor, StoreApi<DecorateStore>>();

// Function to retrieve the decoration store for a given Editor instance
const getOrCreateDecorateStore = (editor: Editor) => {
  let store = EDITOR_TO_DECORATE_STORE.get(editor);
  if (!store) {
    store = createStore<DecorateStore>(() => ({
      decorations: [],
    }));
    EDITOR_TO_DECORATE_STORE.set(editor, store);
  }
  return store;
};

// Helper function to determine if a decoration is specified by its key or by its reference
const predicate = (decorate: Decorate | string) => {
  const isKey = typeof decorate === 'string';
  return (d: Decorate) => {
    return isKey ? d.key === decorate : d === decorate;
  };
};

// Object to handle adding, removing, and checking the presence of decorations in a given Editor instance
export const Decorate = {
  getState: (editor: Editor) => {
    const store = getOrCreateDecorateStore(editor);
    return store.getState().decorations;
  },
  setState: (editor: Editor, decorations: Decorate[]) => {
    const store = getOrCreateDecorateStore(editor);
    store.setState(() => ({
      decorations,
    }));
  },
  // Check if a given value is a TextDecorate
  isTextDecorate: (value: any): value is TextDecorate => {
    return value && typeof value.match === 'function' && typeof value.renderText === 'function';
  },
  getTextDecorations: (editor: Editor, text: Text, path: Path) => {
    const decorations = Decorate.getState(editor);
    return decorations.reduce<{ decorate: TextDecorate; ranges: Range[] }[]>((acc, decorate) => {
      if (!Decorate.isTextDecorate(decorate)) return acc
      const ranges = decorate.match(text, path)
      if (ranges.length > 0) {
        acc.push({ decorate, ranges })
      }
      return acc
    }, [])
  },
  getElementDecorations: (editor: Editor, element: Element, path: Path) => {
    const decorations = Decorate.getState(editor);
    return decorations.reduce<ElementDecorate[]>((acc, decorate) => {
      if (Decorate.isTextDecorate(decorate)) return acc
      if (decorate.match(element, path)) {
        acc.push(decorate)
      }
      return acc
    }, [])
  },
  // Add a decoration to the decorations array of a given Editor instance
  create: (editor: Editor, decorate: Decorate) => {
    const store = getOrCreateDecorateStore(editor);
    store.setState(state => ({
      decorations: [...state.decorations, decorate],
    }));
  },
  // Remove a decoration from the decorations array of a given Editor instance
  remove: (editor: Editor, decorate: Decorate | string) => {
    const store = getOrCreateDecorateStore(editor);
    store.setState(state => ({
      decorations: state.decorations.filter(d => !predicate(decorate)(d)),
    }));
  },
  // Check if a decoration is present in the decorations array of a given Editor instance
  has: (editor: Editor, decorate: Decorate | string) => {
    const store = getOrCreateDecorateStore(editor);
    return store.getState().decorations.some(predicate(decorate));
  },
};
