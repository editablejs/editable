import { StoreApi, createStore, shallow } from "@editablejs/store"
import { HTMLElementTagName, append, createElement, createFragment, createText, detach, insert } from "./node"
import { RefObject, createRef } from "./ref"
import { setAttr, setStyle } from "./attr"

const classMap: Record<HTMLElementTagName, string> = {
  "a": "HTMLAnchorElement",
  "abbr": "HTMLElement",
  "address": "HTMLElement",
  "area": "HTMLAreaElement",
  "article": "HTMLElement",
  "aside": "HTMLElement",
  "audio": "HTMLAudioElement",
  "b": "HTMLElement",
  "base": "HTMLBaseElement",
  "bdi": "HTMLElement",
  "bdo": "HTMLElement",
  "blockquote": "HTMLQuoteElement",
  "body": "HTMLBodyElement",
  "br": "HTMLBRElement",
  "button": "HTMLButtonElement",
  "canvas": "HTMLCanvasElement",
  "caption": "HTMLTableCaptionElement",
  "cite": "HTMLElement",
  "code": "HTMLElement",
  "col": "HTMLTableColElement",
  "colgroup": "HTMLTableColElement",
  "data": "HTMLDataElement",
  "datalist": "HTMLDataListElement",
  "dd": "HTMLElement",
  "del": "HTMLModElement",
  "details": "HTMLDetailsElement",
  "dfn": "HTMLElement",
  "dialog": "HTMLDialogElement",
  "div": "HTMLDivElement",
  "dl": "HTMLDListElement",
  "dt": "HTMLElement",
  "em": "HTMLElement",
  "embed": "HTMLEmbedElement",
  "fieldset": "HTMLFieldSetElement",
  "figcaption": "HTMLElement",
  "figure": "HTMLElement",
  "footer": "HTMLElement",
  "form": "HTMLFormElement",
  "h1": "HTMLHeadingElement",
  "h2": "HTMLHeadingElement",
  "h3": "HTMLHeadingElement",
  "h4": "HTMLHeadingElement",
  "h5": "HTMLHeadingElement",
  "h6": "HTMLHeadingElement",
  "head": "HTMLHeadElement",
  "header": "HTMLElement",
  "hgroup": "HTMLElement",
  "hr": "HTMLHRElement",
  "html": "HTMLHtmlElement",
  "i": "HTMLElement",
  "iframe": "HTMLIFrameElement",
  "img": "HTMLImageElement",
  "input": "HTMLInputElement",
  "ins": "HTMLModElement",
  "kbd": "HTMLElement",
  "label": "HTMLLabelElement",
  "legend": "HTMLLegendElement",
  "li": "HTMLLIElement",
  "link": "HTMLLinkElement",
  "main": "HTMLElement",
  "map": "HTMLMapElement",
  "mark": "HTMLElement",
  "menu": "HTMLMenuElement",
  "meta": "HTMLMetaElement",
  "meter": "HTMLMeterElement",
  "nav": "HTMLElement",
  "noscript": "HTMLElement",
  "object": "HTMLObjectElement",
  "ol": "HTMLOListElement",
  "optgroup": "HTMLOptGroupElement",
  "option": "HTMLOptionElement",
  "output": "HTMLOutputElement",
  "p": "HTMLParagraphElement",
  "picture": "HTMLPictureElement",
  "pre": "HTMLPreElement",
  "progress": "HTMLProgressElement",
  "q": "HTMLQuoteElement",
  "rp": "HTMLElement",
  "rt": "HTMLElement",
  "ruby": "HTMLElement",
  "s": "HTMLElement",
  "samp": "HTMLElement",
  "script": "HTMLScriptElement",
  "search": "HTMLElement",
  "section": "HTMLElement",
  "select": "HTMLSelectElement",
  "slot": "HTMLSlotElement",
  "small": "HTMLElement",
  "source": "HTMLSourceElement",
  "span": "HTMLSpanElement",
  "strong": "HTMLElement",
  "style": "HTMLStyleElement",
  "sub": "HTMLElement",
  "summary": "HTMLElement",
  "sup": "HTMLElement",
  "table": "HTMLTableElement",
  "tbody": "HTMLTableSectionElement",
  "td": "HTMLTableCellElement",
  "template": "HTMLTemplateElement",
  "textarea": "HTMLTextAreaElement",
  "tfoot": "HTMLTableSectionElement",
  "th": "HTMLTableCellElement",
  "thead": "HTMLTableSectionElement",
  "time": "HTMLTimeElement",
  "title": "HTMLTitleElement",
  "tr": "HTMLTableRowElement",
  "track": "HTMLTrackElement",
  "u": "HTMLElement",
  "ul": "HTMLUListElement",
  "var": "HTMLElement",
  "video": "HTMLVideoElement",
  "wbr": "HTMLElement",
}

const createBaseClass = <T extends HTMLElementTagName>(name: T): CustomElementConstructor => {
  const className = classMap[name]
  if (typeof window === 'undefined') return (class __FakeHTMLElement__ { }) as unknown as CustomElementConstructor
  if (!(className in window)) {
    throw new Error(`Class ${className} not found`)
  }
  return window[className as keyof Window]
}

const DOM_TO_STORE_WEAKMAP = new WeakMap<HTMLElement, StoreApi<any>>()
const DOM_TO_UNMOUNT_LISTCALLBACK_WEAKMAP = new WeakMap<HTMLElement, (() => void)[]>()

interface CustomElementInterface<T extends ComponentState> {
  setState: (state: T) => void
  getState: () => T
  subscribe: (callback: (state: T, prevState: T) => void | (() => void), deps?: (keyof T)[]) => void | (() => void)
  createAttributes: (callback: (state: T, prevState: T) => Record<string, string | boolean | number | object | undefined | null> | void, deps?: (keyof T)[]) => void
  createEvent<K extends keyof SVGElementEventMap>(name: K, callback: (state: T, prevState: T) => ((ev: SVGElementEventMap[K]) => void) | void, deps?: (keyof T)[]): void
  createEvent<K extends keyof HTMLElementEventMap>(name: K, callback: (state: T, prevState: T) => ((ev: HTMLElementEventMap[K]) => void) | void, deps?: (keyof T)[]): void
  createEvent<K extends string>(name: K, callback: (state: T, prevState: T) => EventListenerOrEventListenerObject | void, deps?: (keyof T)[]): void
  renderChildren: () => void
}

const getElementStore = (element: HTMLElement) => {
  const store = DOM_TO_STORE_WEAKMAP.get(element)
  if (!store) throw new Error('Store not found for element')
  return store
}

const getElementUnmountListenList = (element: HTMLElement) => {
  let list = DOM_TO_UNMOUNT_LISTCALLBACK_WEAKMAP.get(element)
  if (!list) {
    list = []
    DOM_TO_UNMOUNT_LISTCALLBACK_WEAKMAP.set(element, list)
  }
  return list
}

const addElementUnmountListen = (element: HTMLElement, callback: () => void) => {
  const list = getElementUnmountListenList(element)
  list.push(callback)
}

const createChildrenSubscribe = <T extends ComponentState>(element: HTMLElement & CustomElementInterface<T>, options: ComponentDepsFunctionNode<BaseComponentState>) => {
  const { callback, deps } = options
  const update = (state: T, prevState: T, selfRender = true) => {
    const [children, prevChildren] = toDOMChildren(element, state, prevState)
    applyDOMChildren(element, children, prevChildren)
    const reRender = (newNode: ComponentNode) => {
      FUNCTION_CHILDREN_TO_LAST_VALUE_WEAKMAP.set(callback, newNode)
      const [children, prevChildren] = toDOMChildren(element, state, prevState)
      applyDOMChildren(element, children, prevChildren)
    }
    const node = callback(state, prevState, reRender)
    if (selfRender) reRender(node)
    else {
      FUNCTION_CHILDREN_TO_LAST_VALUE_WEAKMAP.set(callback, node)
    }
    return node
  }
  const unsubscribe = element.subscribe((state, prevState) => {
    update(state, prevState)
  }, deps)
  if(unsubscribe) FUNCTION_CHILDREN_TO_UNSUBSCRIBE_WEAKMAP.set(callback, unsubscribe)
  const prevState = {} as T
  const node = update(element.getState(), prevState, false)
  return node
}

const isFunctionNode = (node: ComponentChildren): node is (ComponentFunctionNode | ComponentDepsFunctionNode) => {
  if (node == null) return false
  const type = typeof node
  return type === 'function' || type === "object" && typeof (node as ComponentDepsFunctionNode).callback === 'function'
}

const FUNCTION_CHILDREN_TO_UNSUBSCRIBE_WEAKMAP = new WeakMap<Function, () => void>()
const FUNCTION_CHILDREN_TO_LAST_VALUE_WEAKMAP = new WeakMap<Function, ComponentNode>()
const toComponentNode = <T extends ComponentState>(element: HTMLElement & CustomElementInterface<T>, state: T, prevState: T) => {
  const { children } = state
  const { children: prevChildren } = prevState
  const isChildrenChanged = !shallow(children, prevChildren)
  if (isFunctionNode(prevChildren) && isChildrenChanged) {
    const callback = typeof prevChildren === 'function' ? prevChildren : prevChildren.callback
    const unsubscribe = FUNCTION_CHILDREN_TO_UNSUBSCRIBE_WEAKMAP.get(callback)
    if (unsubscribe) {
      unsubscribe()
      FUNCTION_CHILDREN_TO_UNSUBSCRIBE_WEAKMAP.delete(callback)
    }
  }
  if (isFunctionNode(children)) {
    if (!isChildrenChanged) {
      const fun = typeof children === 'function' ? children : children.callback
      const currentValue = FUNCTION_CHILDREN_TO_LAST_VALUE_WEAKMAP.get(fun)
      return currentValue
    }
    return createChildrenSubscribe<T>(element, typeof children === 'function' ? { callback: children } : children)

  } else if (Array.isArray(children)) {
    const nodes: BaseComponentNode[] = []
    for (const child of children) {
      const node = toComponentNode(element, { children: child } as T, { children: prevChildren } as T)
      if (Array.isArray(node)) {
        nodes.push(...node)
      } else {
        nodes.push(node)
      }
    }
    return nodes
  } else {
    return children
  }
}

const createChildren = (children: ComponentNode): (Node | null) | ((Node | null)[]) => {
  if (typeof children === 'string' || typeof children === 'number') {
    return createText(String(children))
  } else if (Array.isArray(children)) {
    const nodes: (Node | null)[] = []
    for (const child of children.map(createChildren)) {
      if (Array.isArray(child)) {
        nodes.push(...child)
      } else {
        nodes.push(child)
      }
    }
    return nodes
  } else if (children instanceof Node) {
    return children
  }

  return null
}

type DOMChildren = ReturnType<typeof createChildren>
const ELEMENT_TO_PREV_DOM_WEAKMAP = new WeakMap<HTMLElement, DOMChildren>()
const ELEMENT_TO_PREV_NODE_WEAKMAP = new WeakMap<HTMLElement, ComponentNode>()
const toDOMChildren = <T extends ComponentState>(element: HTMLElement & CustomElementInterface<T>, state: T, prevState: T) => {
  const children = toComponentNode(element, state, prevState)
  const prevChildren = ELEMENT_TO_PREV_NODE_WEAKMAP.get(element)
  const prevDOM = ELEMENT_TO_PREV_DOM_WEAKMAP.get(element)

  ELEMENT_TO_PREV_NODE_WEAKMAP.set(element, children)
  let doms: DOMChildren = null

  if (Array.isArray(children)) {
    doms = []
    const push = (dom?: DOMChildren) => {
      if (!Array.isArray(doms)) return
      if(Array.isArray(dom))
        doms.push(...dom)
      else
        doms.push(dom ?? null)
    }
    for (const child of children) {
      if (Array.isArray(prevChildren)) {
        const index = prevChildren.findIndex(c => c === child)
        if (index > -1 && Array.isArray(prevDOM)) {
          const dom = prevDOM[index]
          push(dom)
        }
      } else if (child === prevChildren) {
        push(prevDOM)
      } else {
        const dom = createChildren(child)
        push(dom)
      }
    }
  } else if (Array.isArray(prevChildren)) {
    const index = prevChildren.findIndex(c => c === children)
    if (index > -1 && Array.isArray(prevDOM)) {
      doms = prevDOM[index]
    } else {
      doms = createChildren(children)
    }
  } else if (prevChildren === children) {
    doms = prevDOM ?? null
  }
  else {
    doms = createChildren(children)
  }

  ELEMENT_TO_PREV_DOM_WEAKMAP.set(element, doms)
  return [doms, prevDOM] as const
}

const applyDOMChildren = (element: HTMLElement, dom: DOMChildren, prevDOM: DOMChildren = null) => {
  if (dom === prevDOM) return

  if (!Array.isArray(dom)) {
    dom = [dom]
  }

  if (!Array.isArray(prevDOM)) {
    prevDOM = [prevDOM]
  }
  // dom is empty
  if (dom.length === 0 || !dom.some(d => d)) {
    element.innerHTML = ''
    return
  }
  // prevDOM is empty
  if (prevDOM.length === 0 || !prevDOM.some(d => d)) {
    for (const d of dom) {
      if(d) append(element, d)
    }
    return
  }
  for (const d of prevDOM) {
    if(d && !dom.find(dom => dom === d)) detach(d)
  }

  let prevNode: Node | null = null
  for (let i = 0; i < dom.length; i++) {
    const d = dom[i]
    if (!d) continue
    const oldDOM = prevDOM.find(dom => dom === d)
    if (oldDOM) {
      prevNode = oldDOM
      continue
    }
    insert(element.shadowRoot ?? element, d, prevNode ? prevNode : (element.firstChild ?? undefined))
    prevNode = d
  }
}

const createClass = (constructor: CustomElementConstructor) => {
  return class<T extends ComponentState> extends constructor implements CustomElementInterface<T> {
    constructor() {
      super();
    }

    setState(state: T) {
      const store = getElementStore(this)
      store.setState(state)
    }

    getState(): T {
      const store = getElementStore(this)
      return store.getState()
    }

    subscribe(callback: (state: T, prevState: T) => void | (() => void), deps?: (keyof T)[]){
      const store = getElementStore(this)
      let customCallback: (() => void) | void
      const call = (state: T, prevState: T) => {
        if (customCallback) customCallback()
        customCallback = callback(state, prevState)
      }

      const update = (state: T, prevState: T) => {
        if (!deps) {
          call(state, prevState)
        } else {
          for (const key of deps) {
            if (!shallow(state[key], prevState[key])) {
              call(state, prevState)
              break
            }
          }
        }
      }
      const unsubscribe = store.subscribe(update)
      const unmount = () => {
        customCallback?.()
        customCallback = undefined
        unsubscribe()
      }
      addElementUnmountListen(this, unmount)
      return unmount
    }

    renderChildren() {
      const update = (state: T, prevState: T) => {
        const [children, prevChildren] = toDOMChildren(this, state, prevState)
        applyDOMChildren(this, children, prevChildren)
      }
      this.subscribe(update, ['children'])
      update(this.getState(), {} as T)
    }

    createAttributes(callback: (state: T, prevState: T) => Record<string, string | boolean | number | undefined | object | null> | void, deps?: (keyof T)[]) {
      const CALLBACK_TO_PREV_ATTRIBUTES_WEAKMAP = new WeakMap<Function, Record<string, string | boolean | number | undefined | object | null>>()
      const update = (state: T, prevState: T) => {
        const prevAttributes = CALLBACK_TO_PREV_ATTRIBUTES_WEAKMAP.get(callback)
        const attributes = callback(state, prevState)
        if (attributes)
          CALLBACK_TO_PREV_ATTRIBUTES_WEAKMAP.set(callback, attributes)
        else
          CALLBACK_TO_PREV_ATTRIBUTES_WEAKMAP.delete(callback)

        if (typeof attributes === 'object') {
          for (const key in attributes) {
            const value = attributes[key]
            if (prevAttributes) {
              const prevValue = prevAttributes[key]
              if (shallow(value, prevValue)) continue
            }
            if (value && key === 'style' && typeof value === 'object') {
              for (const key in value) {
                setStyle(this, key, String((value as Record<string, unknown>)[key]))
              }
            } else {
              setAttr(this, key, value, true)
            }
          }
        }
      }
      this.subscribe(update, deps)
      update(this.getState(), {} as T)
    }

    createEvent<K extends keyof SVGElementEventMap>(name: K, callback: (state: T, prevState: T) => ((ev: SVGElementEventMap[K]) => void) | void, deps?: (keyof T)[]): void
    createEvent<K extends keyof HTMLElementEventMap>(name: K, callback: (state: T, prevState: T) =>( (ev: HTMLElementEventMap[K]) => void) | void, deps?: (keyof T)[]): void
    createEvent<K extends string>(name: K, callback: (state: T, prevState: T) => EventListenerOrEventListenerObject | void, deps?: (keyof T)[]) {
      const CALLBACK_TO_PREV_EVENT_WEAKMAP = new WeakMap<Function, EventListenerOrEventListenerObject>()
      const update = (state: T, prevState: T) => {
        const prevFn = CALLBACK_TO_PREV_EVENT_WEAKMAP.get(callback)
        const fn = callback(state, prevState)

        if (fn)
          CALLBACK_TO_PREV_EVENT_WEAKMAP.set(callback, fn)
        else
          CALLBACK_TO_PREV_EVENT_WEAKMAP.delete(callback)

        if (prevFn) {
          this.removeEventListener(name, prevFn)
        }
        if (fn) {
          this.addEventListener(name, fn)
        }

        return () => {
          if (fn) {
            this.removeEventListener(name, fn)
          }
        }
      }
      this.subscribe(update, deps)
      update(this.getState(), {} as T)
    }

    connectedCallback() {
      const define = (DOM_TO_DEFINE_WEAKMAP.get(this) ?? {}) as ComponentDefine<T, typeof this>
      const store = createStore<T>(() => define.state ?? {} as T)
      const { ref, attributes, mount, events } = define
      if (ref) ref.current = store

      DOM_TO_STORE_WEAKMAP.set(this, store)
      if (attributes) {
        const deps = Array.isArray(attributes) ? attributes : [attributes]
        for (const key of deps) {
          this.createAttributes((state) => {
            return {
              [key]: state[key] ?? undefined
            }
          }, [key])
        }
      }
      if (events) {
        const deps = Array.isArray(events) ? events : [events]
        for (const key of deps) {
          const stringKey = String(key)
          let name: string = stringKey
          if (stringKey.startsWith('on')) {
            name = stringKey.slice(2).toLowerCase()
          }
          this.createEvent(name as keyof HTMLElementEventMap, (state) => {
            const fn = state[key]
            if (typeof fn === 'function') {
              return fn.bind(this)
            }
          }, [key])
        }
      }
      if (mount) {
        const unmount = mount.call(this)
        if (unmount) {
          addElementUnmountListen(this, unmount)
        }
      }
    }

    disconnectedCallback() {
      const list = getElementUnmountListenList(this)
      for (const callback of list) {
        callback()
      }
      DOM_TO_STORE_WEAKMAP.delete(this)
      DOM_TO_UNMOUNT_LISTCALLBACK_WEAKMAP.delete(this)
    }
  }
}

const ELEMENT_NAME_PREFIX = 'e-'

const defineElement = (name: HTMLElementTagName, prefix = ELEMENT_NAME_PREFIX) => {
  if (typeof customElements === 'undefined') return

  const elementName = prefix + name
  if (customElements.get(elementName)) return

  const baseClass = createBaseClass(name)
  const clazz = createClass(baseClass)
  customElements.define(elementName, clazz, { extends: name })
}

for (const name in classMap) {
  defineElement(name as HTMLElementTagName)
}

const DOM_TO_DEFINE_WEAKMAP = new WeakMap<HTMLElement, ComponentDefine<any, any>>()

type BaseComponentNode = Node | string | number | boolean | undefined | null

type ComponentNode = BaseComponentNode | BaseComponentNode[]

type ComponentFunctionNode<S extends ComponentState = ComponentState> = (state: S, prevState: S, reRender: (node: ComponentNode) => void) => ComponentNode

interface ComponentDepsFunctionNode<S extends BaseComponentState = BaseComponentState> {
  callback: (state: S, prevState: S, reRender: (node: ComponentNode) => void) => ComponentNode
  deps?: (keyof S)[]
}

type ComponentChildren<S extends BaseComponentState = BaseComponentState> = BaseComponentNode | ComponentFunctionNode<S> | ComponentDepsFunctionNode<S> | ComponentChildren<S>[]

export interface BaseComponentState {
}

export interface ComponentState<S extends BaseComponentState = BaseComponentState> extends BaseComponentState {
  children?: ComponentChildren<S>
}

export interface ComponentDefine<S extends ComponentState, T extends HTMLElement> {
  state?: S
  attributes?: (keyof Omit<S, "children">)[] | keyof Omit<S, "children">
  events?: (keyof Omit<S, "children">)[] | keyof Omit<S, "children">
  ref?: RefObject<StoreApi<S> | undefined>
  mount?: (this: T & CustomElementInterface<S>) => void | (() => void)
}

export function createComponent<T extends HTMLElementTagName, S extends ComponentState>(name: T, define: ComponentDefine<S, HTMLElementTagNameMap[T]>) {
  const customName = ELEMENT_NAME_PREFIX + name
  const element = createElement(name, { is: customName })
  DOM_TO_DEFINE_WEAKMAP.set(element, define)
  return element
}

export function createComponentRef<T extends ComponentState>() {
  const ref = createRef<StoreApi<T>>()
  return ref
}

interface WithComponentStoreDeps<T extends any = any> {
  store: StoreApi<T>
  deps: (keyof T)[]
}

type WithComponentStoreOptions<T extends any = any> = WithComponentStoreDeps<T> | StoreApi<T>

export function withComponentStore<T extends ComponentState, U = unknown>(element: HTMLElement, callback: (state: U) => T | void, options: WithComponentStoreOptions[]) {
  let batchStates: T[] = []
  const setState = (state: T) => {
    batchStates.push(state)
    Promise.resolve().then(() => {
      const newState = callback(Object.assign({}, ...batchStates))
      batchStates = []
      if(newState == null) return
      DOM_TO_STORE_WEAKMAP.get(element)?.setState(newState)
    })
  }
  for (let store of options) {
    if (!("deps" in store)) {
      store = {
        store,
        deps: []
      }
    }
    const deps = store.deps
    const unsubscribe = store.store.subscribe((state: any, prevState: any) => {
      const changedState = deps.length === 0 ? state : {} as T
      for (const dep in deps) {
        if (!shallow(state[dep], prevState[dep])) {
          changedState[dep as keyof T] = state[dep]
        }
      }
      if (Object.keys(changedState).length > 0) {
        setState(changedState)
      }
    })
    addElementUnmountListen(element, unsubscribe)
  }
}

export function withComponentMount<T extends ComponentState>(element: HTMLElement, callback: (state: T) => void | (() => void)) {
  const store = DOM_TO_STORE_WEAKMAP.get(element)
  if (!store) throw new Error('Store not found for element')
  const unmount = callback(store.getState())
  if (unmount) addElementUnmountListen(element, unmount)
}

export type CreateFunctionComponent<S extends ComponentState = ComponentState> = (props: S, ref?: RefObject<StoreApi<S> | undefined>) => HTMLElement
