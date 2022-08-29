import { BaseElement, BaseText } from '@editablejs/editable-editor';

declare module '@editablejs/editable-editor' {
  interface CustomTypes {
    Element: BaseElement & {
      type?: string;
    };
  }
}
