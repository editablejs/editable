import { ChildPart } from './lit-html/async-directive'
import { FunctionComponent, RenderFunction } from './core'
import { Scheduler, createScheduler } from './scheduler'
import { isServer, BaseElement as _BaseElement } from './utils'

const toCamelCase = (val = ''): string =>
  val.replace(/-+([a-z])?/g, (_, char) => (char ? char.toUpperCase() : ''))

type HTMLComponent<P = {}> = HTMLElement & P

export interface CustomComponent<P = {}> extends FunctionComponent<P, HTMLComponent<P>> {
  observedAttributes?: (keyof P)[]
}

type CustomConstructor<P = {}> = new (...args: unknown[]) => HTMLComponent<P>

interface Creator {
  <P = {}>(renderer: CustomComponent<P>): CustomConstructor<P>
  <P = {}>(renderer: CustomComponent<P>, options: Options<P>): CustomConstructor<P>
  <P = {}>(
    renderer: CustomComponent<P>,
    baseElement: CustomConstructor<{}>,
    options: Omit<Options<P>, 'baseElement'>,
  ): CustomConstructor<P>
}

interface Options<P> {
  baseElement?: CustomConstructor<{}>
  observedAttributes?: (keyof P)[]
  useShadowDOM?: boolean
  shadowRootInit?: ShadowRootInit
}

interface ComponentScheduler<P = {}> extends Scheduler<P, HTMLElement, HTMLComponent<P>> {
  frag: DocumentFragment | HTMLElement
  renderResult?: ChildPart
}

const makeComponent = (render: RenderFunction): Creator => {
  function createComponentScheduler<P = {}>(
    renderer: CustomComponent<P>,
    frag: DocumentFragment,
    host: HTMLElement,
  ): ComponentScheduler<P>
  function createComponentScheduler<P = {}>(
    renderer: CustomComponent<P>,
    host: HTMLElement,
  ): ComponentScheduler<P>
  function createComponentScheduler<P = {}>(
    renderer: CustomComponent<P>,
    frag: DocumentFragment | HTMLElement,
    host?: HTMLElement,
  ): ComponentScheduler<P> {
    const component = (host || frag) as HTMLComponent<P>
    const scheduler = createScheduler<P, HTMLElement, HTMLComponent<P>>(
      component,
    ) as ComponentScheduler<P>
    scheduler.commit = (result: unknown): void => {
      scheduler.renderResult = render(result, frag)
    }

    scheduler.render = () => {
      return scheduler.state.run(() => renderer.call(component, component))
    }

    return scheduler
  }

  function component<P = {}>(renderer: CustomComponent<P>): CustomConstructor<P>
  function component<P = {}>(
    renderer: CustomComponent<P>,
    options: Options<P>,
  ): CustomConstructor<P>
  function component<P = {}>(
    renderer: CustomComponent<P>,
    baseElement: CustomConstructor<P>,
    options: Omit<Options<P>, 'baseElement'>,
  ): CustomConstructor<P>
  function component<P = {}>(
    renderer: CustomComponent<P>,
    baseElementOrOptions?: CustomConstructor<P> | Options<P>,
    options?: Options<P>,
  ): CustomConstructor<P> {
    const BaseElement =
      (options || (baseElementOrOptions as Options<P>) || {}).baseElement || _BaseElement
    const {
      observedAttributes = [],
      useShadowDOM = true,
      shadowRootInit = {},
    } = options || (baseElementOrOptions as Options<P>) || {}

    let _scheduler: ComponentScheduler<P>
    class Element extends BaseElement {
      static get observedAttributes(): (keyof P)[] {
        return renderer.observedAttributes || observedAttributes || []
      }

      constructor() {
        super()
        if (useShadowDOM === false) {
          _scheduler = createComponentScheduler(renderer, this)
        } else {
          this.attachShadow({ mode: 'open', ...shadowRootInit })
          _scheduler = createComponentScheduler(renderer, this.shadowRoot!, this)
        }
      }

      connectedCallback(): void {
        _scheduler?.update()
        //@ts-ignore
        _scheduler.renderResult?.setConnected(true)
      }

      disconnectedCallback(): void {
        _scheduler?.teardown()
        //@ts-ignore
        _scheduler.renderResult?.setConnected(false)
      }

      attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
        if (oldValue === newValue) {
          return
        }
        let val = newValue === '' ? true : newValue
        Reflect.set(this, toCamelCase(name), val)
      }
    }

    const reflectiveProp = <T>(initialValue: T): Readonly<PropertyDescriptor> => {
      let value = initialValue
      let isSetup = false
      return Object.freeze({
        enumerable: true,
        configurable: true,
        get(): T {
          return value
        },
        set(this: Element, newValue: T): void {
          // Avoid scheduling update when prop value hasn't changed
          if (isSetup && value === newValue) return
          isSetup = true
          value = newValue
          _scheduler?.update()
        },
      })
    }

    const proto = new Proxy(BaseElement.prototype, {
      getPrototypeOf(target) {
        return target
      },

      set(target, key: string, value, receiver): boolean {
        let desc: PropertyDescriptor | undefined
        if (key in target) {
          desc = Object.getOwnPropertyDescriptor(target, key)
          if (desc && desc.set) {
            desc.set.call(receiver, value)
            return true
          }

          Reflect.set(target, key, value, receiver)
          return true
        }

        if (typeof key === 'symbol' || key[0] === '_') {
          desc = {
            enumerable: true,
            configurable: true,
            writable: true,
            value,
          }
        } else {
          desc = reflectiveProp(value)
        }
        Object.defineProperty(receiver, key, desc)

        if (desc.set) {
          desc.set.call(receiver, value)
        }

        return true
      },
    })

    Object.setPrototypeOf(Element.prototype, proto)

    return Element as unknown as CustomConstructor<P>
  }

  return component
}

export { makeComponent }
export type { HTMLComponent, CustomConstructor, Creator as CustomCreator }

export interface DefineCreator {
  <P = {}>(renderer: CustomConstructor<P>, name: string): void
  <P = {}>(renderer: CustomComponent<P>, name: string): void
  <P = {}>(renderer: CustomComponent<P>, options: DefineOptions<P>): void
  <P = {}>(
    renderer: CustomComponent<P>,
    baseElement: CustomConstructor<P>,
    options: Omit<DefineOptions<P>, 'baseElement'>,
  ): void
}

const isCustomConstructor = <P = {}>(
  component: CustomComponent<P> | CustomConstructor<P>,
): component is CustomConstructor<P> => {
  return component.prototype instanceof Element
}

interface DefineOptions<P = {}> extends Options<P> {
  name: string
}

const makeDefine = (component: Creator) => {
  function define<P = {}>(renderer: CustomConstructor<P>, name: string): void
  function define<P = {}>(renderer: CustomComponent<P>, name: string): void
  function define<P = {}>(renderer: CustomComponent<P>, options: DefineOptions<P>): void
  function define<P = {}>(
    renderer: CustomComponent<P>,
    baseElement: CustomConstructor<P>,
    options: Omit<DefineOptions<P>, 'baseElement'>,
  ): void
  function define<P = {}>(
    renderer: CustomComponent<P> | CustomConstructor<P>,
    baseElementOrOptions?: CustomConstructor<P> | DefineOptions<P> | string,
    options?: DefineOptions<P>,
  ): void {
    if (isServer) return
    if (isCustomConstructor(renderer)) {
      let name: string | undefined = baseElementOrOptions as string
      if (typeof baseElementOrOptions !== 'string') {
        name = (baseElementOrOptions as DefineOptions<P>).name
      }
      if (!!customElements.get(name)) return
      customElements.define(name, renderer)
    } else {
      const _options = options || (baseElementOrOptions as DefineOptions<P>) || {}
      let name: string | undefined = undefined
      if (typeof _options === 'string') {
        options = undefined
        baseElementOrOptions = undefined
        name = _options
      } else {
        name = _options.name
      }
      if (!!customElements.get(name)) return
      const Element = component(
        renderer,
        baseElementOrOptions as CustomConstructor,
        options as Options<P>,
      )
      customElements.define(name, Element)
    }
  }

  return define
}
export { makeDefine }
