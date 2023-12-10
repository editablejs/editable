export const isFunction = <T extends Function>(value: unknown): value is T =>
  typeof value === 'function'

export const isServer = typeof window === 'undefined'

export const BaseElement = isServer ? (class __FakeHTMLElement__ { }) as unknown as CustomElementConstructor : HTMLElement
