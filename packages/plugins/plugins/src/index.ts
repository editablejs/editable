import { Editable } from '@editablejs/editor'
import * as UI from '@editablejs/plugin-ui'
import Toolbar from '@editablejs/plugin-toolbar'
import { MarkEditor, MarkOptions, withMark } from '@editablejs/plugin-mark'
import { FontSizeEditor, FontSizeOptions, withFontSize } from '@editablejs/plugin-fontsize'
import { HeadingEditor, HeadingOptions, withHeading } from '@editablejs/plugin-heading'
import { BlockquoteOptions, withBlockquote, BlockquoteEditor } from '@editablejs/plugin-blockquote'
import { IndentEditor, IndentOptions, withIndent } from '@editablejs/plugin-indent'
import {
  OrderedListOptions,
  withOrderedList,
  OrderedListEditor,
  UnOrderedListOptions,
  withUnOrderedList,
  UnOrderedListEditor,
  TaskListOptions,
  withTaskList,
  TaskListEditor,
} from '@editablejs/plugin-list'
import { TableOptions, TableEditor, withTable } from '@editablejs/plugin-table'
import {
  ContextMenuEditor,
  ContextMenuOptions,
  withContextMenu,
} from '@editablejs/plugin-context-menu'
import { GlobalEditor, GlobalOptions, withGlobal } from '@editablejs/plugin-base'
import { SerializeEditor, SerializeOptions, withSerialize } from '@editablejs/plugin-serializes'

export interface PluginOptions {
  global?: GlobalOptions
  serialize?: SerializeOptions
  'context-menu'?: ContextMenuOptions
  mark?: MarkOptions
  'font-size'?: FontSizeOptions
  heading?: HeadingOptions
  blockquote?: BlockquoteOptions
  'ordered-list'?: OrderedListOptions
  'unordered-list'?: UnOrderedListOptions
  'task-list'?: TaskListOptions
  indent?: IndentOptions
  table?: TableOptions
}

export const withPlugins = (editor: Editable, options: PluginOptions = {}) => {
  let newEditor = withContextMenu(editor)
  newEditor = withSerialize(newEditor, options.serialize)
  newEditor = withGlobal(newEditor, options.global)
  newEditor = withIndent(newEditor, options.indent)
  newEditor = withMark(newEditor, options.mark)
  newEditor = withFontSize(newEditor, options['font-size'])
  newEditor = withHeading(newEditor, options.heading)
  newEditor = withBlockquote(newEditor, options.blockquote)
  newEditor = withOrderedList(newEditor, options['ordered-list'])
  newEditor = withUnOrderedList(newEditor, options['unordered-list'])
  newEditor = withTaskList(newEditor, options['task-list'])
  newEditor = withTable(newEditor, options.table)
  return newEditor as Editable &
    GlobalEditor &
    SerializeEditor &
    ContextMenuEditor &
    MarkEditor &
    HeadingEditor &
    FontSizeEditor &
    BlockquoteEditor &
    OrderedListEditor &
    IndentEditor &
    UnOrderedListEditor &
    TaskListEditor &
    TableEditor
}

export * from '@editablejs/plugin-mark'
export * from '@editablejs/plugin-fontsize'
export * from '@editablejs/plugin-heading'
export * from '@editablejs/plugin-blockquote'
export * from '@editablejs/plugin-list'
export * from '@editablejs/plugin-indent'
export * from '@editablejs/plugin-table'
export * from '@editablejs/plugin-toolbar'
export * from '@editablejs/plugin-context-menu'
export * from '@editablejs/plugin-base'
export * from '@editablejs/plugin-serializes'

export { Toolbar, UI }
