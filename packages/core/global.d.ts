import { Element, Text, Node } from '@editablejs/model'
import { EditableInterface } from '@editablejs/core';

declare global {
  interface Window {
    Editable: {
      createEditable: () => EditableInterface
      Element: typeof Element
      Text: typeof Text
      Node: typeof Node
    }
  }
}