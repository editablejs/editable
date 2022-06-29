import { SelectionInterface } from "./types"

export interface InputInterface {

  getTextarea(): HTMLTextAreaElement
  
  updateContainers(containers: HTMLElement[]): void

  focus(): void

  blur(): void
  
  onKeydown(event: KeyboardEvent): void

  onKeyup(event: KeyboardEvent): void

  onCompositionStart(event: CompositionEvent): void

  onCompositionEnd(event: CompositionEvent): void

  onInput(event: InputEvent): void

  onFocus(): void

  onBlur(): void
}

export const INPUT_BOX_STYLE = {
  opacity: '0',
  outline: 'none',
  caretColor: 'transparent',
  overflow: 'hidden',
}


const INPUT_WEAK_MAP = new WeakMap<SelectionInterface, InputInterface>();
const IS_FOCUS_WEAK_MAP = new WeakMap<SelectionInterface, boolean>();
const TEXTAREA_WEAK_MAP = new WeakMap<InputInterface, HTMLTextAreaElement>()
const CONTAINERS_WEAK_MAP = new WeakMap<InputInterface, HTMLElement[]>()
const IS_CONTAINER_MOUSE_DOWN = new WeakMap<InputInterface, boolean>()
const IS_COMPOSITON_WEAK_MAP = new WeakMap<InputInterface, boolean>()

export const isFocus = (selection: SelectionInterface) => {
  return IS_FOCUS_WEAK_MAP.get(selection) ?? false
}

const createTextarea = () => {
  const textarea = document.createElement('textarea')
  textarea.setAttribute('rows', '1')
  textarea.setAttribute('style', 'font-size: inherit; line-height: 1; padding: 0px; border: none; white-space: nowrap; width: 1em;overflow: auto;resize: vertical;')
  return textarea
}

export const createInput = (selection: SelectionInterface) => {

  const setFocus = (focus: boolean) => {
    if(IS_FOCUS_WEAK_MAP.get(selection) === focus) return
    IS_FOCUS_WEAK_MAP.set(selection, focus)
    if(focus) {
      input.onFocus()
    } else {
      input.onBlur()
    }
  }

  const handleDomMouseDown = (event: MouseEvent) => {
    if(!IS_CONTAINER_MOUSE_DOWN.has(input) && !event.defaultPrevented) setFocus(false)
  }

  const handleContainerMouseDown = () => { 
    IS_CONTAINER_MOUSE_DOWN.set(input, true)
    setFocus(true)
  }

  const handleKeydown = (event: KeyboardEvent) => { 
    selection.onKeydown(event)
  }

  const handleKeyup = (event: KeyboardEvent) => { 
    selection.onKeyup(event)
  }

  const handleBlur = () => {
    if(!IS_CONTAINER_MOUSE_DOWN.has(input)) setFocus(false)
  }

  const handleInput = (event: Event) => { 
    if(!(event.target instanceof HTMLTextAreaElement)) return
    const value = event.target.value
    if(!IS_COMPOSITON_WEAK_MAP.has(input)) {
      input.getTextarea().value = ''
    }
    selection.onInput(new InputEvent('input', { ...event, data: value }))
  }

  const handleCompositionStart = (ev: CompositionEvent) => {
    IS_COMPOSITON_WEAK_MAP.set(input, true)
    selection.onCompositionStart(ev)
  }

  const handleCompositionEnd = (ev: CompositionEvent) => { 
    IS_COMPOSITON_WEAK_MAP.set(input, false)
    input.getTextarea().value = ''
    selection.onCompositionEnd(ev)
  }

  const input: InputInterface = {
    getTextarea(){
      if(TEXTAREA_WEAK_MAP.has(input)) return TEXTAREA_WEAK_MAP.get(input)!
      const textarea = createTextarea()
      TEXTAREA_WEAK_MAP.set(input, textarea)
      document.body.addEventListener('mousedown', handleDomMouseDown)
      document.body.addEventListener('mouseup', handleDomMouseDown)

      textarea.addEventListener('blur', handleBlur)
      textarea.addEventListener('input', handleInput)
      textarea.addEventListener('compositionstart', handleCompositionStart)
      textarea.addEventListener('compositionend', handleCompositionEnd)
      textarea.addEventListener('keydown', handleKeydown)
      textarea.addEventListener('keyup', handleKeyup)
      
      return textarea
    },

    updateContainers(containers: HTMLElement[]){ 
      const oldContainers = CONTAINERS_WEAK_MAP.get(input)
      oldContainers?.forEach(container => {
        container.removeEventListener('mousedown', handleContainerMouseDown);
      })
      containers.forEach(container => {
        container.addEventListener('mousedown', handleContainerMouseDown);
      })
    },

    onKeydown(event: KeyboardEvent){},

    onKeyup(event: KeyboardEvent){},

    onCompositionStart(event: CompositionEvent){},

    onCompositionEnd(event: CompositionEvent){},

    onInput(event: Event){},

    onFocus(){
      selection.onFocus()
    },

    onBlur(){
      selection.onBlur()
    },

    focus(){
      input.getTextarea().focus({
        preventScroll: true
      })
    },
  
    blur(){
      input.getTextarea().blur()
    }
  }
  INPUT_WEAK_MAP.set(selection, input)
  return input
}