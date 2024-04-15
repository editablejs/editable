import { DOMNode } from '@/dom-utils';

import {
  Editor,
  Element,
  Node,
  Path,
  Range,
  Text,
} from '@/interfaces';


export interface DecorationRenderProps<T = Node> {
  node: T;
  path: Path;
  children: DOMNode;
}

export interface BaseDecoration {
  key?: string;
}

export interface TextDecoration extends BaseDecoration {
  match: (node: Text, path: Path) => Range[];
  renderText: (props: DecorationRenderProps<Text>) => HTMLElement;
}

export interface ElementDecoration extends BaseDecoration {
  match: (node: Element, path: Path) => boolean;
  renderElement: (props: DecorationRenderProps<Element>) => HTMLElement;
}

export type Decoration = TextDecoration | ElementDecoration;

export interface DecorationInterface {
  isTextDecoration: (decoration: Decoration) => decoration is TextDecoration;
  isElementDecoration: (decoration: Decoration) => decoration is ElementDecoration;
  getDecorations: (editor: Editor) => Decoration[];
  getTextDecorations: (editor: Editor, node: Text, path: Path) => { decoration: TextDecoration, ranges: Range[] }[];
  getElementDecorations: (editor: Editor, node: Element, path: Path) => ElementDecoration[];
  addDecoration: (editor: Editor, decoration: Decoration) => void;
  removeDecoration: (editor: Editor, decoration: Decoration | string) => void;
}

const EDITOR_TO_DECORATION_WEAK_MAP = new WeakMap<Editor, Decoration[]>();

const getOrCreateDecoration = (editor: Editor) => {
  let decorations = EDITOR_TO_DECORATION_WEAK_MAP.get(editor);
  if (!decorations) {
    decorations = [];
    EDITOR_TO_DECORATION_WEAK_MAP.set(editor, decorations);
  }
  return decorations;
}

const isKeyOrDecoration = (decoration: Decoration | string) => {
  const isKey = typeof decoration === 'string';
  return (d: Decoration) => {
    return isKey ? d.key === decoration : d === decoration;
  };
};

export const Decoration: DecorationInterface = {
  isTextDecoration: (value: any): value is TextDecoration => {
    return value && typeof value.match === 'function' && typeof value.renderText === 'function';
  },
  isElementDecoration: (value: any): value is ElementDecoration => {
    return value && typeof value.match === 'function' && typeof value.renderElement === 'function';
  },
  getDecorations: (editor: Editor) => {
    return getOrCreateDecoration(editor);
  },
  getTextDecorations: (editor: Editor, text: Text, path: Path) => {
    const decorations = getOrCreateDecoration(editor);
    return decorations.reduce<{ decoration: TextDecoration; ranges: Range[] }[]>((acc, decoration) => {
      if (!Decoration.isTextDecoration(decoration)) return acc;
      const ranges = decoration.match(text, path);
      if (ranges.length > 0) {
        acc.push({ decoration, ranges });
      }
      return acc;
    }, []);
  },
  getElementDecorations: (editor: Editor, element: Element, path: Path) => {
    const decorations = getOrCreateDecoration(editor);
    return decorations.reduce<ElementDecoration[]>((acc, decoration) => {
      if (Decoration.isTextDecoration(decoration)) return acc;
      if (decoration.match(element, path)) {
        acc.push(decoration);
      }
      return acc;
    }, []);
  },
  addDecoration: (editor: Editor, decoration: Decoration) => {
    const decorations = getOrCreateDecoration(editor);
    decorations.push(decoration);
  },
  removeDecoration: (editor: Editor, decoration: Decoration | string) => {
    const decorations = getOrCreateDecoration(editor);
    const predicate = isKeyOrDecoration(decoration);
    const index = decorations.findIndex(predicate);
    if (index > -1) {
      decorations.splice(index, 1);
    }
  },
}
