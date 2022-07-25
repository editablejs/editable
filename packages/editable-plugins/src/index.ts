export * from './mark'
export * from './fontsize'
export * from './heading'
export * from './blockquote'

import { EditableEditor } from '@editablejs/editor'
import { FontSizeInterface, FontSizeOptions, withFontSize } from './fontsize'
import { HeadingInterface, HeadingOptions, withHeading } from './heading'
import { BlockquoteOptions, withBlockquote, BlockquoteInterface } from './blockquote'
import { MarkInterface, MarkOptions, withMark } from './mark'
import Toolbar from './toolbar'

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
}

export const withPlugins = (editor: EditableEditor, options: PluginOptions = {}) => { 
  let newEditor = withMark(editor, options.mark)
  newEditor = withFontSize(newEditor, options.fontSize)
  newEditor = withHeading(newEditor, options.heading)
  newEditor = withBlockquote(newEditor, options.blockquote)
  return newEditor as EditableEditor & MarkInterface & HeadingInterface & FontSizeInterface & BlockquoteInterface
}