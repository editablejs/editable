import { NodeKey } from "@editablejs/model";
import { isServer } from "@editablejs/utils";

const DATA_LAYER_ELEMENT = 'data-layer-element'
const DATA_CARET_KEY = 'caret'
const DATA_BLOCK_KEY = 'block'
export interface DrawRect {
  left: number
  top: number
  width: number
  height: number
  color: string
}
export interface LayerInterface {

  getShadow(): HTMLElement | null

  getRoot(): HTMLElement | null

  createBox(key: NodeKey, rect: Partial<DrawRect>, styles?: Partial<CSSStyleDeclaration>): HTMLDivElement

  updateBox(box: HTMLDivElement, rect: Partial<DrawRect>, styles?: Partial<CSSStyleDeclaration>): HTMLDivElement

  drawCaret(rect: DrawRect): void
  
  drawBlocks(...rects: DrawRect[]): void

  setCaretState(state: boolean): void

  clear(...keys: string[]): void

  clearCaret(): void

  clearSelection(): void

  appendChild(child: HTMLElement): void
}

const LAYER_TO_BODY_WEAK_MAP = new WeakMap<LayerInterface, HTMLElement>()
const LAYER_TO_SHADOW_WEAK_MAP = new WeakMap<LayerInterface, HTMLElement>()
const CARET_STATE_WEAK_MAP = new WeakMap<LayerInterface, boolean>();
const CARET_TIMER_WEAK_MAP = new WeakMap<LayerInterface, number>()

const createShadow = (layer: LayerInterface, container: HTMLElement = document.body) => {
  if(isServer) return null
  const shadow = document.createElement('div')
  const root = document.createElement('div')
  root.setAttribute('style', 'position: absolute; z-index: 2; top: 0px;')
  const body = document.createElement('div')
  body.setAttribute('style', 'pointer-events: none;')
  root.appendChild(body)
  const shadowRoot = shadow.attachShadow({mode: 'open'})
  shadowRoot.appendChild(root)
  container.appendChild(shadow)
  LAYER_TO_BODY_WEAK_MAP.set(layer, body)
  LAYER_TO_SHADOW_WEAK_MAP.set(layer, shadow)
  return body
}

export const removeLayer = (layer: LayerInterface) => {
  clearTimeout(CARET_TIMER_WEAK_MAP.get(layer))
  CARET_TIMER_WEAK_MAP.delete(layer)
  LAYER_TO_BODY_WEAK_MAP.delete(layer)
  LAYER_TO_SHADOW_WEAK_MAP.get(layer)?.remove()
  LAYER_TO_SHADOW_WEAK_MAP.delete(layer)
}

export const createLayer = () => {

  const layer: LayerInterface = {

    getRoot(){
      return LAYER_TO_BODY_WEAK_MAP.get(layer) ?? null
    },

    getShadow(){
      return LAYER_TO_SHADOW_WEAK_MAP.get(layer) ?? null
    },

    createBox(key: string, position: DrawRect, styles?: Partial<CSSStyleDeclaration>){ 
      const box = document.createElement('div')
      box.setAttribute(DATA_LAYER_ELEMENT, key)
      return layer.updateBox(box, position, styles)
    },
  
    updateBox(box: HTMLDivElement, rect: DrawRect, styles?: Partial<CSSStyleDeclaration>){ 
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
    },
  
    setCaretState(state: boolean){ 
      CARET_STATE_WEAK_MAP.set(layer, state)
    },
  
    drawCaret(rect: DrawRect){
      clearTimeout(CARET_TIMER_WEAK_MAP.get(layer))
      const caret = layer.createBox(DATA_CARET_KEY, Object.assign({}, rect, {  width: Math.max(rect.width || 1, 1) }))
      const activeCaret = () => {
        clearTimeout(CARET_TIMER_WEAK_MAP.get(layer))
        const caretTimer = setTimeout(() => { 
          if(CARET_STATE_WEAK_MAP.get(layer) !== false) {
            const currentState = caret.style.opacity === '1'
            caret.style.opacity = currentState ? '0' : '1'
          } else {
            caret.style.opacity = '1'
          }
          activeCaret()
        }, 530)
        CARET_TIMER_WEAK_MAP.set(layer, caretTimer)
      }
      activeCaret()
      layer.appendChild(caret)
    },
  
    drawBlocks(...rects: DrawRect[]){
      rects.forEach(rect => { 
        const line = layer.createBox(DATA_BLOCK_KEY, rect)
        layer.appendChild(line)
      })
    },
  
    appendChild(child: HTMLElement) { 
      let body = LAYER_TO_BODY_WEAK_MAP.get(layer) ?? null
      if(!body) body = createShadow(layer)
      body?.appendChild(child)
    },
  
    clearSelection(){
      layer.clear(DATA_CARET_KEY, DATA_BLOCK_KEY)
    },
  
    clearCaret() {
      layer.clear(DATA_CARET_KEY)
    },

    clear(...keys: string[]){
      const body = LAYER_TO_BODY_WEAK_MAP.get(layer)
      if(keys.length === 0) {
        let child = body?.firstChild
        while(child) { 
          const next = child.nextSibling
          body?.removeChild(child)
          child = next
        }
      } else {
        const selection = keys.map(key => `[${DATA_LAYER_ELEMENT}="${key}"]`).join(',')
        const childList = body?.querySelectorAll(selection)
        childList?.forEach(child => {
          body?.removeChild(child)
        })
      }
    }
  }
  return layer
}
