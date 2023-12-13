const JS_TO_CSS: Record<string, string> = {}
const CSS_REGEX = /[A-Z]/g
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i

export const toStyleString = (value: Record<string, unknown>) => {
  return Object.keys(value).reduce((style, prop) => {
    const arr = formatStyle(prop, value[prop])
    if (!arr) return style
    const [name, val] = arr
    return style + `${name}:${val};`
  }, '')
}

export const formatStyle = (prop: string, value: unknown): [string, unknown] => {
  const name: string =
    prop[0] == '-'
      ? prop
      : JS_TO_CSS[prop] || (JS_TO_CSS[prop] = prop.replace(CSS_REGEX, '-$&').toLowerCase())
  if (value == null) {
    return [name, null]
  } else if (typeof value != 'number' || name.startsWith('--') || IS_NON_DIMENSIONAL.test(prop)) {
    return [name, value]
  } else {
    return [name, `${value}px`]
  }
}

export interface StyleInfo {
  [name: string]: string | number | undefined | null
}

export const updateStyleProperty = (style: CSSStyleDeclaration, prop: string, val: unknown) => {
  const [name, value] = formatStyle(prop, val)
  if (value == null) {
    style.removeProperty(name)
  } else {
    style.setProperty(name, String(value))
  }
}

export const updateStyle = (style: CSSStyleDeclaration, info: StyleInfo) => {
  for (const prop in info) {
    updateStyleProperty(style, prop, info[prop])
  }
}
