import { Editor } from '@editablejs/models'
import { getOptions } from '../options'

export interface ContextMenuEditor extends Editor {}

export const ContextMenuEditor = {
  getOptions,
}
