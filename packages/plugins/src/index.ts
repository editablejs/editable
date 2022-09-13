import { Editable } from '@editablejs/editor';
import * as UI from './ui'
import { MarkEditor, MarkOptions, withMark } from './mark';
import { FontSizeEditor, FontSizeOptions, withFontSize } from './fontsize';
import { HeadingEditor, HeadingOptions, withHeading } from './heading';
import { BlockquoteOptions, withBlockquote, BlockquoteEditor } from './blockquote';
import Toolbar from './toolbar';
import { IndentEditor, IndentOptions, withIndent } from './indent';
import { OrderedListOptions, withOrderedList, OrderedListEditor } from './list/ordered';
import { UnOrderedListOptions, withUnOrderedList, UnOrderedListEditor } from './list/unordered';
import { TaskListOptions, withTaskList, TaskListEditor } from './list/task';
import { TableOptions, TableEditor, withTable } from './table';

export * from './mark';
export * from './fontsize';
export * from './heading';
export * from './blockquote';
export * from './list/base';
export * from './list/ordered';
export * from './list/unordered';
export * from './list/task';
export * from './indent';
export * from './table';
export * from './toolbar';

export { Toolbar, UI };
interface PluginOptions {
  mark?: MarkOptions;
  fontSize?: FontSizeOptions;
  heading?: HeadingOptions;
  blockquote?: BlockquoteOptions;
  orderedList?: OrderedListOptions;
  unOrderedList?: UnOrderedListOptions;
  taskList?: TaskListOptions;
  indent?: IndentOptions;
  table?: TableOptions;
}

export const withPlugins = (editor: Editable, options: PluginOptions = {}) => {
  let newEditor = withMark(editor, options.mark);
  newEditor = withFontSize(newEditor, options.fontSize);
  newEditor = withIndent(newEditor, options.indent);
  newEditor = withHeading(newEditor, options.heading);
  newEditor = withBlockquote(newEditor, options.blockquote);
  newEditor = withOrderedList(newEditor, options.orderedList);
  newEditor = withUnOrderedList(newEditor, options.unOrderedList);
  newEditor = withTaskList(newEditor, options.taskList);
  newEditor = withTable(newEditor, options.table);
  return newEditor as Editable &
    MarkEditor &
    HeadingEditor &
    FontSizeEditor &
    BlockquoteEditor &
    OrderedListEditor &
    IndentEditor &
    UnOrderedListEditor &
    TaskListEditor &
    TableEditor;
};
