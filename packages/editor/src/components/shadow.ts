import { createElement, setAttribute, setAttributes } from "@/dom-utils";
import { EDITOR_TO_SHADOW } from "../utils/weak-maps";
import { Editor } from "@/interfaces";

export const createShadowComponent = (editor: Editor) => {
  const container = createElement('div')
  setAttribute(container, 'style', 'position:absolute;top:0;left:0;z-index:1;')
  const shadow = container.attachShadow({ mode: 'open' })
  EDITOR_TO_SHADOW.set(editor, shadow)
  return container
}

export interface ShadowBlockPosition {
  top: number
  left: number
}

export interface ShadowBlockSize {
  width: number
  height: number
}

export type ShadowBlockBackgroundColor = string

export type ShadowBlockOpacity = number

export interface ShadowBlockProps {
  position: ShadowBlockPosition
  size: ShadowBlockSize
  bgColor?: ShadowBlockBackgroundColor
  opacity?: ShadowBlockOpacity
}

export const createShadowBlockComponent = (props: ShadowBlockProps) => {
  const container = createElement('div')
  setAttribute(container, 'style', 'position:absolute;top:0;left:0;z-index:1;')

  const updateBackgroundColor = (bgColor?: ShadowBlockBackgroundColor, opacity?: ShadowBlockOpacity) => {
    setAttributes(container, {
      style: {
        backgroundColor: bgColor ?? 'transparent',
        opacity: opacity ?? '',
      }
    })
  }

  const updatePosition = (position: ShadowBlockPosition) => {
    setAttributes(container, {
      style: {
        left: `${position.left}px`,
        top: `${position.top}px`,
      }
    })
  }

  const updateSize = (size: ShadowBlockSize) => {
    setAttributes(container, {
      style: {
        width: `${size.width}px`,
        height: `${size.height}px`
      }
    })
  }

  const update = (props: ShadowBlockProps) => {
    updatePosition(props.position)
    updateSize(props.size)
    updateBackgroundColor(props.bgColor, props.opacity)
  }

  update(props)

  return {
    container,
    update,
    updateBackgroundColor,
    updatePosition,
    updateSize
  }
}
