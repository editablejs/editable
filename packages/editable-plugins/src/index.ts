export * from './mark'
export * from './fontsize'
export * from './heading'
export * from './blockquote'
export * from './list'
export * from './indent'

import { Editable } from '@editablejs/editor'
import { MarkInterface, MarkOptions, withMark } from './mark'
import { FontSizeInterface, FontSizeOptions, withFontSize } from './fontsize'
import { HeadingInterface, HeadingOptions, withHeading } from './heading'
import { BlockquoteOptions, withBlockquote, BlockquoteInterface } from './blockquote'
import { ListInterface, ListOptions, withList } from './list';
import Toolbar from './toolbar'
import { IndentInterface, IndentOptions, withIndent } from './indent'

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
  newEditor = withHeading(newEditor, options.heading)
  newEditor = withBlockquote(newEditor, options.blockquote)
  newEditor = withList(newEditor, options.list)
  newEditor = withIndent(newEditor, options.indent)
  return newEditor as Editable & MarkInterface & HeadingInterface & FontSizeInterface & BlockquoteInterface & ListInterface & IndentInterface
}