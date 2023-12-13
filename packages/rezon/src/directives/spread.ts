import { nothing, Part, ElementPart, render } from 'lit-html'
import { AsyncDirective } from 'lit-html/async-directive.js'
import { directive } from 'lit-html/directive.js'
import { Ref } from '../use-ref'
import { toStyleString, updateStyle } from './utils/style'

type EventListenerWithOptions = EventListenerOrEventListenerObject &
  Partial<AddEventListenerOptions>

const onChangeInputType = (type: string) =>
  (typeof Symbol != 'undefined' && typeof Symbol() == 'symbol' ? /fil|che|rad/ : /fil|che|ra/).test(
    type,
  )

const CAMEL_PROPS =
  /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/
const ON_ANI = /^on(Ani|Tra|Tou|BeforeInp|Compo)/
const CAMEL_REPLACE = /[A-Z0-9]/g
/**
 * Usage:
 *    import { html, render } from 'lit';
 *    import { spreadProps } from '@open-wc/lit-helpers';
 *
 *    render(
 *      html`
 *        <div
 *          ${spreadProps({
 *              prop1: 'prop1',
 *              prop2: ['Prop', '2'],
 *              prop3: {
 *                  prop: 3,
 *              }
 *          })}
 *        ></div>
 *      `,
 *      document.body,
 *    );
 */
export class SpreadPropsDirective extends AsyncDirective {
  host!: EventTarget | object | Element
  element!: Element
  prevData: Record<string, unknown> = {}

  render(_spreadData: object) {
    return nothing
  }
  update(part: Part, [spreadData]: Parameters<this['render']>) {
    if (this.element !== (part as ElementPart).element) {
      this.element = (part as ElementPart).element
    }
    const data: Record<string, unknown> = {}

    const nodeType = this.element.nodeName.toLowerCase()
    const constructor = this.element.constructor as CustomElementConstructor & {
      observedAttributes?: string[]
    }
    const observedAttributes = constructor.observedAttributes
    for (const key in spreadData) {
      let name = key
      // @ts-ignore
      let value = spreadData[key]
      if (name === 'ref') {
        const ref = value as Ref<Element>
        if (typeof ref === 'function') {
          ref(this.element)
        } else if (ref) {
          ref.current = this.element
        }
        continue
      }
      if (name === 'children') {
        const rootPart = render(value, this.element as unknown as HTMLElement)
        // @ts-ignore
        rootPart._$parent = part
        continue
      }
      if (name === 'className' && value) {
        data['class'] = value
        continue
      }
      if (name === 'style' && value && typeof value === 'object') {
        updateStyle((this.element as HTMLElement).style, value)
        continue
      }
      let lowerCased = name.toLowerCase()
      if (lowerCased === 'ondoubleclick') {
        name = 'ondblclick'
      } else if (
        lowerCased === 'onchange' &&
        (nodeType === 'input' || nodeType === 'textarea') &&
        !onChangeInputType((this.element as HTMLInputElement).type)
      ) {
        lowerCased = name = 'oninput'
      } else if (lowerCased === 'onfocus') {
        name = 'onfocusin'
      } else if (lowerCased === 'onblur') {
        name = 'onfocusout'
      } else if (ON_ANI.test(name)) {
        name = lowerCased
      } else if (nodeType.indexOf('-') === -1 && CAMEL_PROPS.test(name)) {
        name = name.replace(CAMEL_REPLACE, '-$&').toLowerCase()
      } else if (value === null) {
        value = undefined
      } else if (typeof value === 'boolean') {
        name = '?' + name
      }
      if (lowerCased === 'oninput') {
        name = lowerCased
        // @ts-ignore
        if (spreadData[name]) {
          name = 'oninputCapture'
        }
      }
      if (name[0] === 'o' && name[1] === 'n') {
        name = name.replace(/(PointerCapture)$|Capture$/, '$1')
        if (lowerCased in this.element) name = '@' + lowerCased.slice(2)
        else name = '@' + name.slice(2)
      } else if (observedAttributes && !(name in observedAttributes)) {
        name = '.' + name
      }
      data[name] = value
    }
    this.host = part.options?.host || this.element
    this.apply(data)
    this.groom(data)
    this.prevData = { ...data }
  }

  apply(data: Record<string, unknown>) {
    if (!data) return
    const { prevData, element } = this
    for (const key in data) {
      const value = data[key]
      if (value === prevData[key]) {
        continue
      }
      // @ts-ignore
      element[key] = value
    }
  }

  groom(data: Record<string, unknown>) {
    const { prevData, element } = this
    if (!prevData) return
    for (const key in prevData) {
      // @ts-ignore
      if (!data || (!(key in data) && element[key] === prevData[key])) {
        // @ts-ignore
        element[key] = undefined
      }
    }
  }
}

export const spreadProps = directive(SpreadPropsDirective)

/**
 * Usage:
 *    import { html, render } from 'lit';
 *    import { spreadEvents } from '@open-wc/lit-helpers';
 *
 *    render(
 *      html`
 *        <div
 *          ${spreadEvents({
 *            '@my-event': () => console.log('my-event fired'),
 *            '@my-other-event': () => console.log('my-other-event fired'),
 *            '@my-additional-event':
 *              () => console.log('my-additional-event fired'),
 *          })}
 *        ></div>
 *      `,
 *      document.body,
 *    );
 */
export class SpreadEventsDirective extends SpreadPropsDirective {
  eventData: Record<string, unknown> = {}

  apply(data: Record<string, unknown>) {
    if (!data) return
    for (const key in data) {
      const value = data[key]
      if (value === this.eventData[key]) {
        // do nothing if the same value is being applied again.
        continue
      }
      this.applyEvent(key, value as EventListenerWithOptions)
    }
  }

  applyEvent(eventName: string, eventValue: EventListenerWithOptions) {
    const { prevData, element } = this
    this.eventData[eventName] = eventValue
    const prevHandler = prevData[eventName]
    if (prevHandler) {
      element.removeEventListener(eventName, this, eventValue)
    }
    element.addEventListener(eventName, this, eventValue)
  }

  groom(data: Record<string, unknown>) {
    const { prevData, element } = this
    if (!prevData) return
    for (const key in prevData) {
      // @ts-ignore
      if (!data || (!(key in data) && element[key] === prevData[key])) {
        this.groomEvent(key, prevData[key] as EventListenerWithOptions)
      }
    }
  }

  groomEvent(eventName: string, eventValue: EventListenerWithOptions) {
    const { element } = this
    delete this.eventData[eventName]
    element.removeEventListener(eventName, this, eventValue)
  }

  handleEvent(event: Event) {
    const value: Function | EventListenerObject = this.eventData[event.type] as
      | Function
      | EventListenerObject
    if (typeof value === 'function') {
      ;(value as Function).call(this.host, event)
    } else {
      ;(value as EventListenerObject).handleEvent(event)
    }
  }

  disconnected() {
    const { eventData, element } = this
    for (const key in eventData) {
      // event listener
      const name = key.slice(1)
      const value = eventData[key] as EventListenerWithOptions
      element.removeEventListener(name, this, value)
    }
  }

  reconnected() {
    const { eventData, element } = this
    for (const key in eventData) {
      // event listener
      const name = key.slice(1)
      const value = eventData[key] as EventListenerWithOptions
      element.addEventListener(name, this, value)
    }
  }
}

export const spreadEvents = directive(SpreadEventsDirective)

/**
 * Usage:
 *    import { html, render } from 'lit';
 *    import { spread } from '@open-wc/lit-helpers';
 *
 *    render(
 *      html`
 *        <div
 *          ${spread({
 *            'my-attribute': 'foo',
 *            '?my-boolean-attribute': true,
 *            '.myProperty': { foo: 'bar' },
 *            '@my-event': () => console.log('my-event fired'),
 *          })}
 *        ></div>
 *      `,
 *      document.body,
 *    );
 */
export class SpreadDirective extends SpreadEventsDirective {
  apply(data: Record<string, unknown>) {
    if (!data) return
    const { prevData, element } = this
    for (const key in data) {
      const value = data[key]
      if (value === prevData[key]) {
        continue
      }
      const name = key.slice(1)
      switch (key[0]) {
        case '@': // event listener
          this.eventData[name] = value
          this.applyEvent(name, value as EventListenerWithOptions)
          break
        case '.': // property
          // @ts-ignore
          element[name] = value
          break
        case '?': // boolean attribute
          if (value) {
            element.setAttribute(name, '')
          } else {
            element.removeAttribute(name)
          }
          break
        default:
          // standard attribute
          if (value != null) {
            element.setAttribute(key, String(value))
          } else {
            element.removeAttribute(key)
          }
          break
      }
    }
  }

  groom(data: Record<string, unknown>) {
    const { prevData, element } = this
    if (!prevData) return
    for (const key in prevData) {
      const name = key.slice(1)
      // @ts-ignore
      if (!data || (!(key in data) && element[name] === prevData[key])) {
        switch (key[0]) {
          case '@': // event listener
            this.groomEvent(name, prevData[key] as EventListenerWithOptions)
            break
          case '.': // property
            // @ts-ignore
            element[name] = undefined
            break
          case '?': // boolean attribute
            element.removeAttribute(name)
            break
          default:
            // standard attribute
            element.removeAttribute(key)
            break
        }
      }
    }
  }
}

export const spread = directive(SpreadDirective)
