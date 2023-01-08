import { Editable } from '@editablejs/editor'
import { MarkEditor, MarkOptions, withMark } from '@editablejs/plugin-mark'
import { FontSizeEditor, FontSizeOptions, withFontSize } from '@editablejs/plugin-font-size'
import { FontColorEditor, FontColorOptions, withFontColor } from '@editablejs/plugin-font-color'
import {
  BackgroundColorEditor,
  BackgroundColorOptions,
  withBackgroundColor,
} from '@editablejs/plugin-background-color'
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
import { LinkOptions, LinkEditor, withLink } from '@editablejs/plugin-link'
import { ImageOptions, ImageEditor, withImage } from '@editablejs/plugin-image'
import { HrOptions, HrEditor, withHr } from '@editablejs/plugin-hr'
import { AlignOptions, AlignEditor, withAlign } from '@editablejs/plugin-align'
import { LeadingOptions, LeadingEditor, withLeading } from '@editablejs/plugin-leading'
import { MentionOptions, MentionEditor, withMention } from '@editablejs/plugin-mention'
import {
  ContextMenuEditor,
  ContextMenuOptions,
  withContextMenu,
} from '@editablejs/plugin-context-menu'

export interface PluginOptions {
  contextMenu?: ContextMenuOptions
  mark?: MarkOptions
  fontSize?: FontSizeOptions
  fontColor?: FontColorOptions
  backgroundColor?: BackgroundColorOptions
  heading?: HeadingOptions
  blockquote?: BlockquoteOptions
  orderedList?: OrderedListOptions
  unorderedList?: UnOrderedListOptions
  taskList?: TaskListOptions
  indent?: IndentOptions
  table?: TableOptions
  link?: LinkOptions
  image?: ImageOptions
  hr?: HrOptions
  align?: AlignOptions
  leading?: LeadingOptions
  mention?: MentionOptions
}

export const withPlugins = <T extends Editable>(editor: T, options: PluginOptions = {}) => {
  let newEditor = withContextMenu(editor)
  newEditor = withIndent(newEditor, options.indent)
  newEditor = withMark(newEditor, options.mark)
  newEditor = withFontSize(newEditor, options.fontSize)
  newEditor = withFontColor(newEditor, options.fontColor)
  newEditor = withBackgroundColor(newEditor, options.backgroundColor)
  newEditor = withHeading(newEditor, options.heading)
  newEditor = withBlockquote(newEditor, options.blockquote)
  newEditor = withOrderedList(newEditor, options.orderedList)
  newEditor = withUnOrderedList(newEditor, options.unorderedList)
  newEditor = withTaskList(newEditor, options.taskList)
  newEditor = withTable(newEditor, options.table)
  newEditor = withLink(newEditor, options.link)
  newEditor = withImage(newEditor, options.image)
  newEditor = withHr(newEditor, options.hr)
  newEditor = withAlign(newEditor, options.align)
  newEditor = withLeading(newEditor, options.leading)
  newEditor = withMention(newEditor, options.mention)
  return newEditor as T &
    ContextMenuEditor &
    MarkEditor &
    HeadingEditor &
    FontSizeEditor &
    BlockquoteEditor &
    OrderedListEditor &
    IndentEditor &
    UnOrderedListEditor &
    TaskListEditor &
    TableEditor &
    LinkEditor &
    ImageEditor &
    HrEditor &
    AlignEditor &
    LeadingEditor &
    FontColorEditor &
    BackgroundColorEditor &
    MentionEditor
}

export * from '@editablejs/plugin-mark'
export * from '@editablejs/plugin-font-size'
export * from '@editablejs/plugin-font-color'
export * from '@editablejs/plugin-background-color'
export * from '@editablejs/plugin-heading'
export * from '@editablejs/plugin-blockquote'
export * from '@editablejs/plugin-list'
export * from '@editablejs/plugin-indent'
export * from '@editablejs/plugin-table'
export * from '@editablejs/plugin-context-menu'
export * from '@editablejs/plugin-link'
export * from '@editablejs/plugin-image'
export * from '@editablejs/plugin-hr'
export * from '@editablejs/plugin-align'
export * from '@editablejs/plugin-leading'
export * from '@editablejs/plugin-mention'
