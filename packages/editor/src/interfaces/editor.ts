import { BaseEditor, BaseEditorInterface } from "./base-editor";
import { Editable, EditableInterface } from "./editable";


export interface EditorInterface extends BaseEditorInterface, EditableInterface {

}

export interface Editor extends BaseEditor, Editable {

}

export const Editor: EditorInterface = {
  ...BaseEditor,
  ...Editable
} as const

export * from './base-editor'
export * from './editable'