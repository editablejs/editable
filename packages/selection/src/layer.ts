import type { IRange, ILayer, LayerPosition } from "./types";

interface DrawRange extends IRange {
  color?: string
  width?: number
}

const DATA_LAYER_ELEMENT = 'data-layer-element'
const DATA_CARET_KEY = 'caret'
const DATA_LINE_KEY = 'line'

export default class SelectionLayer implements ILayer {

  private caretTimer: NodeJS.Timeout | null = null
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

  createBox = (key: string, position: LayerPosition) => { 
    const box = document.createElement('div')
    box.setAttribute(DATA_LAYER_ELEMENT, key)
    return this.updateBox(box, position)
  }

  updateBox = (box: HTMLDivElement, position: LayerPosition) => { 
    box.setAttribute('style', `position: absolute;
    top: 0px; 
    left: 0px; 
    width: ${position.width}px; 
    transform: translateX(${position.left}px) translateY(${position.top}px);
    height: ${position.height}px; 
    opacity: 1;
    background-color: ${position.color || 'rgba(0,127,255,0.3)'};
    willChange: transform, height, opacity;
    z-index: 1;`)
    return box
  }

  draw = (...ranges: DrawRange[]) => {
    ranges.forEach(this.drawRange)
  }

  drawRange = (range: DrawRange) => { 
    const rects = range.getClientRects()
    if(!rects) return
    if(range.isCollapsed) {
      this.drawCaret({...rects[0].toJSON(), width: range.width || 2, color: range.color || '#000'})
    } else {
      this.drawLines(...Array.from(rects).map(rect => ({ ...rect.toJSON() })))
    }
  }

  setCaretState = (state: boolean) => { 
    this.caretState = state
  }

  drawCaret = (position: LayerPosition) => {
    if(this.caretTimer) clearTimeout(this.caretTimer)
    this.clear(DATA_CARET_KEY, DATA_LINE_KEY)
    const caret = this.createBox(DATA_CARET_KEY, { ...position, width: Math.max(position.width || 1, 1), color: position.color || '#000' })
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

  drawLines = (...position: LayerPosition[]) => {
    this.clear(DATA_CARET_KEY, DATA_LINE_KEY)
    position.forEach(pos => { 
      const line = this.createBox(DATA_LINE_KEY, { ...pos, color: pos.color || 'rgba(0,127,255,0.3)' })
      this.appendChild(line)
    })
  }

  appendChild = (child: HTMLElement) => { 
    this.body.appendChild(child)
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