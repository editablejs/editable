import { ComponentState, CreateFunctionComponent, createComponent } from "@editablejs/dom-utils";
import { EDITOR_TO_SHADOW } from "../utils/weak-maps";
import { Editor } from "@editablejs/models";

export interface ShadowProps extends ComponentState {
  editor: Editor
}

export const createShadow: CreateFunctionComponent<ShadowProps> = (props, ref) => {
  const container = createComponent('div', {
    state: props,
    ref,
    mount() {
      this.setAttribute("style", "position:absolute;top:0;left:0;z-index:1;")
      this.attachShadow({ mode: 'open' })

      this.subscribe((state) => {
        EDITOR_TO_SHADOW.set(state.editor, this.shadowRoot)
      }, ['editor'])
    },
  })
  return container
}

export interface ShadowBlockProps extends ComponentState {
  position: {
    top: number
    left: number
  }
  size: {
    width: number
    height: number
  }
  bgColor?: string
  opacity?: number
}

export const createShadowBlock: CreateFunctionComponent<ShadowBlockProps> = (props, ref) => {
  return createComponent("div", {
    ref,
    state: props,
    mount() {
      this.setAttribute("style", "position:absolute;top:0;left:0;z-index:1;")
      this.createAttributes((state) => {
        const { bgColor } = state
        return {
          style: {
            backgroundColor: bgColor ?? 'transparent',
            opacity: state.opacity ?? '',
          }
        }
      }, ['bgColor', 'opacity'])

      this.createAttributes((state) => {
        const { position } = state
        return {
          style: {
            left: `${position.left}px`,
            top: `${position.top}px`,
          }
        }
      }, ['position'])

      this.createAttributes((state) => {
        const { size } = state
        return {
          style: {
            width: `${size.width}px`,
            height: `${size.height}px`
          }
        }
      }, ['size'])
    },
  })
}
