import { Editable } from '@editablejs/editor'
import * as UI from './ui'
import { MarkEditor, MarkOptions, withMark } from './mark'
import { FontSizeEditor, FontSizeOptions, withFontSize } from './fontsize'
import { HeadingEditor, HeadingOptions, withHeading } from './heading'
import { BlockquoteOptions, withBlockquote, BlockquoteEditor } from './blockquote'
import Toolbar from './toolbar'
import { IndentEditor, IndentOptions, withIndent } from './indent'
import { OrderedListOptions, withOrderedList, OrderedListEditor } from './list/ordered'
import { UnOrderedListOptions, withUnOrderedList, UnOrderedListEditor } from './list/unordered'
import { TaskListOptions, withTaskList, TaskListEditor } from './list/task'
import { TableOptions, TableEditor, withTable } from './table'
import { ContextMenuOptions, withContextMenu } from './context-menu'
import { GlobalEditor, GlobalOptions, withGlobal } from './global'

export * from './mark'
export * from './fontsize'
export * from './heading'
export * from './blockquote'
export * from './list/base'
export * from './list/ordered'
export * from './list/unordered'
export * from './list/task'
export * from './indent'
export * from './table'
export * from './toolbar'

export { Toolbar, UI }
export interface PluginOptions {
  global?: GlobalOptions
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
  let newEditor = withGlobal(editor)
  newEditor = withMark(editor, options.mark)
  newEditor = withFontSize(newEditor, options['font-size'])
  newEditor = withIndent(newEditor, options.indent)
  newEditor = withHeading(newEditor, options.heading)
  newEditor = withBlockquote(newEditor, options.blockquote)
  newEditor = withOrderedList(newEditor, options['ordered-list'])
  newEditor = withUnOrderedList(newEditor, options['unordered-list'])
  newEditor = withTaskList(newEditor, options['task-list'])
  newEditor = withTable(newEditor, options.table)
  newEditor = withContextMenu(newEditor)
  return newEditor as Editable &
    GlobalEditor &
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
