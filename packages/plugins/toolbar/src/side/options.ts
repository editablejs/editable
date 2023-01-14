import { Editable } from '@editablejs/editor'
import { SideToolbarLocale } from './locale'

export interface SideToolbarOptions {
  locale?: Record<string, SideToolbarLocale>
  delayHideDuration?: number
  delayDragDuration?: number
  horizontalDistanceThreshold?: number
  verticalDistanceThreshold?: number
}

export const SIDE_TOOLBAR_OPTIONS = new WeakMap<Editable, SideToolbarOptions>()

export const getOptions = (editable: Editable): SideToolbarOptions => {
  return SIDE_TOOLBAR_OPTIONS.get(editable) || {}
}

export const setOptions = (editable: Editable, options: SideToolbarOptions): void => {
  SIDE_TOOLBAR_OPTIONS.set(editable, options)
}
