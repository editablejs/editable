import type { ILayer, DrawRect } from "./types";

const DATA_LAYER_ELEMENT = 'data-layer-element'
const DATA_CARET_KEY = 'caret'
const DATA_BLOCK_KEY = 'block'

export default class SelectionLayer implements ILayer {

  private caretTimer: number | null = null
  protected root: HTMLElement
  protected body: HTMLElement
  protected shadow: HTMLElement
  protected caretState = true

  constructor(container: HTMLElement = document.body) {
    this.shadow = document.createElement('div')
    this.root = document.createElement('div')
    this.root.setAttribute('style', 'position: absolute; z-index: 2; top: 0px;')
    this.body = document.createElement('div')
    this.body.setAttribute('style', 'pointer-events: none;')
    this.root.appendChild(this.body)
    const shadowRoot = this.shadow.attachShadow({mode: 'open'})
    shadowRoot.appendChild(this.root)
    container.appendChild(this.shadow)
  }

  getBody = () => {
    return this.body
  }

  createBox = (key: string, position: DrawRect, styles?: Partial<CSSStyleDeclaration>) => { 
    const box = document.createElement('div')
    box.setAttribute(DATA_LAYER_ELEMENT, key)
    return this.updateBox(box, position, styles)
  }

  updateBox = (box: HTMLDivElement, rect: DrawRect, styles?: Partial<CSSStyleDeclaration>) => { 
    const css = box.style
    css.position = 'absolute'
    css.top = '0px'
    css.left = '0px'
    css.width = `${rect.width || 0}px`
    css.height = `${rect.height || 0}px`
    css.transform = `translateX(${rect.left || 0}px) translateY(${rect.top || 0}px)`
    css.opacity = '1'
    css.backgroundColor = `${rect.color || 'transparent'}`
    css.willChange = 'transform, height, opacity'
    css.zIndex = '1'
    if (styles) { 
      for (const key in styles) { 
        const val = styles[key]
        if(val !== undefined) css[key] = val
      }
    }
    return box
  }

  setCaretState = (state: boolean) => { 
    this.caretState = state
  }

  drawCaret = (rect: DrawRect) => {
    if(this.caretTimer) clearTimeout(this.caretTimer)
    const caret = this.createBox(DATA_CARET_KEY, Object.assign({}, rect, {  width: Math.max(rect.width || 1, 1) }))
    const activeCaret = () => {
      if(this.caretTimer) clearTimeout(this.caretTimer)
      this.caretTimer = setTimeout(() => { 
        if(this.caretState) {
          const currentState = caret.style.opacity === '1'
          caret.style.opacity = currentState ? '0' : '1'
        } else {
          caret.style.opacity = '1'
        }
        activeCaret()
      }, 530)
    }
    activeCaret()
    this.appendChild(caret)
  }

  drawBlocks = (...rects: DrawRect[]) => {
    rects.forEach(rect => { 
      const line = this.createBox(DATA_BLOCK_KEY, rect)
      this.appendChild(line)
    })
  }

  appendChild = (child: HTMLElement) => { 
    this.body.appendChild(child)
  }

  clearSelection = () => {
    this.clear(DATA_CARET_KEY, DATA_BLOCK_KEY)
  }

  clearCaret = () => {
    this.clear(DATA_CARET_KEY)
  }

  clear = (...keys: string[]) => {
    if(keys.length === 0) {
      let child = this.body.firstChild
      while(child) { 
        const next = child.nextSibling
        this.body.removeChild(child)
        child = next
      }
    } else {
      const selection = keys.map(key => `[${DATA_LAYER_ELEMENT}="${key}"]`).join(',')
      const childList = this.body.querySelectorAll(selection)
      childList.forEach(child => {
        this.body.removeChild(child)
      })
    }
  }

  destroy = () => {
    this.shadow.remove()
  }
}

export type {
  ILayer
}