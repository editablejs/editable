import { StoreApi } from "@editablejs/store"
import { ComponentState, RefObject } from "@editablejs/dom-utils"

export interface ButtonState extends ComponentState {
  disabled?: boolean
  htmlType?: 'button' | 'submit' | 'reset'
  type?: 'primary' | 'default' | 'danger' | 'link' | 'text'
  shape?: 'circle' | 'round'
  onClick?: (ev: MouseEvent) => void
  onMouseDown?: (ev: MouseEvent) => void
  icon?: unknown
}

export type CreateButton = (props: ButtonState, ref?: RefObject<StoreApi<ButtonState>>) => unknown
