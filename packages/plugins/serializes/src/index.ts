import escapeHtml from 'escape-html'
import { Descendant, Editable, Editor, Text, Node, DOMNode, isDOMText } from '@editablejs/editor'

export interface SerializeOptions {}

export const SERIALIZE_OPTIONS = new WeakMap<Editable, SerializeOptions>()

type WithFunction = (editor: SerializeEditor) => void

const withSet = new Set<WithFunction>()
const withUnshift = new Set<WithFunction>()

export interface SerializeHtmlOptions {
  node: Node
  attributes?: Record<string, any>
  styles?: Record<string, any>
}

export interface DeserializeHtmlOptions {
  node: DOMNode
  attributes?: Record<string, any>
  markAttributes?: Record<string, any>
  stripBreak?: true | ((text: string) => boolean)
}
export interface SerializeEditor extends Editable {
  serializeText: (node: Node) => string
  serializeHtml: (options: SerializeHtmlOptions) => string
  deserializeHtml: (options: DeserializeHtmlOptions) => Descendant[]
}

const FLUSHING: WeakMap<Editor, boolean> = new WeakMap()

export const SerializeEditor = {
  isSerializeEditor(editor: Editable): editor is SerializeEditor {
    return 'serializeHtml' in editor
  },

  serializeHtml: (editor: Editable, options: SerializeHtmlOptions) => {
    if (SerializeEditor.isSerializeEditor(editor)) {
      return editor.serializeHtml(options)
    }
    return ''
  },

  deserializeHtml: (editor: Editable, options: DeserializeHtmlOptions) => {
    if (SerializeEditor.isSerializeEditor(editor)) {
      return editor.deserializeHtml(options)
    }
    return []
  },

  createHtml: (
    tag: string,
    attributes: Record<string, any> = {},
    styles: Record<string, any> = {},
    children: string = '',
  ) => {
    const attrs = []
    for (const key in attributes) {
      attrs.push(`${key}="${escapeHtml(attributes[key])}"`)
    }
    const _styles = []
    for (const key in styles) {
      const val = styles[key]
      if (!val) continue
      _styles.push(`${key}: ${styles[key]}`)
    }
    let style = ''
    if (_styles.length > 0) {
      style = `style="${escapeHtml(_styles.join(';'))}"`
    }
    return `<${tag} ${attrs.join(' ')} ${style}>${children}</${tag}>`
  },

  with: (editor: Editable, fn: WithFunction, unshift: boolean = false) => {
    if (unshift) {
      if (!FLUSHING.get(editor)) {
        FLUSHING.set(editor, true)
        Promise.resolve().then(() => {
          FLUSHING.set(editor, false)
          if (SerializeEditor.isSerializeEditor(editor)) {
            withUnshift.forEach(fn => fn(editor))
            withUnshift.clear()
          }
        })
      }
      withUnshift.add(fn)
    } else if (SerializeEditor.isSerializeEditor(editor)) {
      fn(editor)
    } else {
      withSet.add(fn)
    }
  },
}

export const withSerialize = <T extends Editable>(editor: T, options: SerializeOptions = {}) => {
  const newEditor = editor as T & SerializeEditor

  SERIALIZE_OPTIONS.set(newEditor, options)

  newEditor.serializeText = (node: Node) => {
    if (Text.isText(node)) return escapeHtml(node.text)

    if (Editor.isEditor(node))
      return node.children
        .map(children => {
          const text = newEditor.serializeText(children)
          return Editor.isBlock(newEditor, children) ? text + '\n' : text
        })
        .join('')
    const nodes = node.children
    return nodes
      .map((children, index) => {
        let text = newEditor.serializeText(children)
        if (Editor.isBlock(newEditor, children) && index !== nodes.length - 1) {
          text += '\n'
        }
        return text
      })
      .join('')
  }

  newEditor.serializeHtml = (options: SerializeHtmlOptions) => {
    const { node, attributes, styles } = options
    if (Text.isText(node)) return escapeHtml(node.text)
    if (Editor.isEditor(node))
      return node.children.map(child => newEditor.serializeHtml({ node: child })).join('')
    const { type, children } = node
    const childrenHtml = children.map(child => newEditor.serializeHtml({ node: child })).join('')
    let tag = type ?? 'p'
    switch (type) {
      case 'paragraph':
        tag = 'p'
        break
    }
    return SerializeEditor.createHtml(tag, attributes, styles, childrenHtml)
  }

  newEditor.deserializeHtml = options => {
    const { node, attributes, markAttributes, stripBreak } = options
    if (isDOMText(node)) {
      const text = node.textContent ?? ''
      if (
        stripBreak &&
        /^\s{0,}(\r\n|\n)+\s{0,}$/.test(text) &&
        (typeof stripBreak === 'boolean' || stripBreak(text))
      ) {
        return []
      }
      const lines = text.split(/\r\n|\n/)
      return lines.map(line => ({ ...markAttributes, text: line }))
    }

    const children = []
    for (const child of node.childNodes) {
      children.push(...newEditor.deserializeHtml({ node: child, markAttributes }))
    }

    switch (node.nodeName) {
      case 'P':
      case 'DIV':
        if (children.length === 0) children.push({ text: '' })
        return [{ ...attributes, type: 'paragraph', children }]
      default:
        return children
    }
  }

  withSet.forEach(fn => fn(newEditor))
  withSet.clear()

  withUnshift.forEach(fn => fn(newEditor))
  withUnshift.clear()

  return newEditor
}
