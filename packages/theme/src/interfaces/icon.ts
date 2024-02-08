import { StoreApi } from "@editablejs/store"
import { BaseState } from "./base"
import { RefObject } from "@editablejs/dom-utils"

export interface IconState extends BaseState {
  width?: number | string
  height?: number | string
  className?: string
  onClick?: (ev: MouseEvent) => void
  onMouseDown?: (ev: MouseEvent) => void
}

export interface IconProps<T = string> extends IconState {
  name?: T
}

export type CreateIcon<T = string> = (props: IconProps<T>, ref?: RefObject<StoreApi<IconState>>) => unknown
