import { attr, element } from "@editablejs/dom-utils";

export const createShadow = () => {
  const container = element('div')
  attr(container, 'style', "position:absolute;top:0;left:0;z-index:2;")
  container.attachShadow({ mode: 'open' })
  return {
    shadowContainer: container,
    shadowRoot: container.shadowRoot as ShadowRoot
  }
}

export interface CreateShadowBlockOptions {
  position: {
    top: number
    left: number
  }
  size: {
    width: number
    height: number
  }
  bgColor?: string
  style?: string
}

export const createShadowBlock = (options: CreateShadowBlockOptions) => {
  const container = element('div')
  const { position, size, bgColor, style } = options
  const { top, left } = position
  const { width, height } = size
  attr(container, 'style', `position:absolute;top:${top}px;left:${left}px;width:${width}px;height:${height}px;background-color:${bgColor ?? 'transparent'};z-index:1;${style ?? ''}`)
  return container
}
