export * from './mark'
export * from './fontsize'
export * from './heading'
export * from './blockquote'
export * from './list'
export * from './indent'

import { Editable } from '@editablejs/editor'
import { MarkEditor, MarkOptions, withMark } from './mark'
import { FontSizeEditor, FontSizeOptions, withFontSize } from './fontsize'
import { HeadingEditor, HeadingOptions, withHeading } from './heading'
import { BlockquoteOptions, withBlockquote, BlockquoteEditor } from './blockquote'
import { ListEditor, ListOptions, withList } from './list';
import Toolbar from './toolbar'
import { IndentEditor, IndentOptions, withIndent } from './indent'

export {
  Toolbar
}

export * from './toolbar'
export * from './icon'
interface PluginOptions {
  mark?: MarkOptions
  fontSize?: FontSizeOptions
  heading?: HeadingOptions
  blockquote?: BlockquoteOptions
  list?: ListOptions
  indent?: IndentOptions
}

export const withPlugins = (editor: Editable, options: PluginOptions = {}) => { 
  let newEditor = withMark(editor, options.mark)
  newEditor = withFontSize(newEditor, options.fontSize)
  newEditor = withIndent(newEditor, options.indent)
  newEditor = withHeading(newEditor, options.heading)
  newEditor = withBlockquote(newEditor, options.blockquote)
  newEditor = withList(newEditor, options.list)
  return newEditor as Editable & MarkEditor & HeadingEditor & FontSizeEditor & BlockquoteEditor & ListEditor & IndentEditor
}