const kebabCase = (str: string) => {
  const regex = new RegExp(/[A-Z]/g)
  return str.replace(regex, v => `-${v.toLowerCase()}`)
}
/**
 * CSSStyle 转换为 style 字符串
 */
export const cssStyleToString = (style: Partial<CSSStyleDeclaration>): string => {
  return Object.keys(style).reduce((accumulator, key) => {
    // transform the key from camelCase to kebab-case
    const cssKey = kebabCase(key)
    // remove ' in value
    const cssValue = (style as Record<string, any>)[key].replace("'", '')
    // build the result
    // you can break the line, add indent for it if you need
    return `${accumulator}${cssKey}:${cssValue};`
  }, '')
}

/**
 * React.HTMLAttributes<HTMLElement> 转换为 attributes 字符串
 */
export const htmlAttributesToString = (attributes: Record<string, any>): string => {
  return Object.keys(attributes).reduce((accumulator, key) => {
    // transform the key from camelCase to kebab-case
    const attrKey = kebabCase(key)
    // remove ' in value
    const attrValue = String(attributes[key]).replace("'", '')
    // build the result
    // you can break the line, add indent for it if you need
    return `${accumulator}${attrKey}="${attrValue}" `
  }, '')
}
