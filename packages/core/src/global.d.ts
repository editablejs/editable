import Editor from './index';
import { Element, Text } from '@editablejs/model'

declare global {
  interface Window {
    Editable: {
      Editor: typeof Editor;
      Element: typeof Element
      Text: typeof Text
    }
  }
}