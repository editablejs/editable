import { ILayerContainer, Position } from "./types"

export default class SelectionLayerContainer implements ILayerContainer {
  #caretTimer: NodeJS.Timeout | null = null
  private root: HTMLElement
  private body: HTMLElement
  private shadow: HTMLElement

  constructor(){
    this.shadow = document.createElement('div')
    this.root = document.createElement('div')
    this.root.setAttribute('style', 'position: absolute; z-index: 2; top: 0px;')
    this.body = document.createElement('div')
    this.body.setAttribute('style', 'pointer-events: none;')
    this.root.appendChild(this.body)
    const shadowRoot = this.shadow.attachShadow({mode: 'open'})
    shadowRoot.appendChild(this.root)
  }

  getShadow() {
    return this.shadow
  }

  createLine(position: Position) { 
    const line = document.createElement('div')
    line.setAttribute('style', `position: absolute;
    top: 0px; 
    left: 0px; 
    width: ${position.width}px; 
    transform: translateX(${position.left}px) translateY(${position.top}px);
    height: ${position.height}px; 
    opacity: 1;
    background-color: ${position.color || 'rgba(0,127,255,0.3)'};
    willChange: transform, height, opacity;
    z-index: 1;`)
    return line
  }

  setCaret(position: Position) {
    this.clear()
    const caret = this.createLine({ ...position, width: Math.max(position.width || 1, 1), color: position.color || '#000' })
    const activeCaret = () => {
      if(this.#caretTimer) clearTimeout(this.#caretTimer)
      this.#caretTimer = setTimeout(() => { 
        caret.style.opacity = caret.style.opacity === '1' ? '0' : '1'
        activeCaret()
      }, 530)
    }
    activeCaret()
    this.body.appendChild(caret)
  }

  setLines(...position: Position[]) {
    this.clear()
    position.forEach(pos => { 
      const line = this.createLine({ ...pos, color: pos.color || 'rgba(0,127,255,0.3)' })
      this.body.appendChild(line)
    })
  }

  clear() {
    if(this.#caretTimer) clearTimeout(this.#caretTimer)
    let child = this.body.firstChild
    while(child) { 
      const next = child.nextSibling
      this.body.removeChild(child)
      child = next
    }
  }
}