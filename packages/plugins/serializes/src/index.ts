import escapeHtml from 'escape-html'
import { jsx } from 'slate-hyperscript'
import { Descendant, Editable, Editor, Text, Node } from '@editablejs/editor'

export interface SerializeOptions {}

export const SERIALIZE_OPTIONS = new WeakMap<Editable, SerializeOptions>()

export interface SerializeEditor extends Editable {
  serializeText: (node: Node) => string
  serializeHtml: (node: Node) => string
  deserializeHtml: (
    el: globalThis.Node,
    attributes?: Record<string, any>,
  ) => Descendant | Descendant[]
}

export const SerializeEditor = {
  isSerializeEditor(editor: Editable): editor is SerializeEditor {
    return 'serializeHtml' in editor
  },

  serializeHtml: (editor: Editable, node: Node) => {
    if (SerializeEditor.isSerializeEditor(editor)) {
      return editor.serializeHtml(node)
    }
    return ''
  },
}

export const withSerialize = <T extends Editable>(editor: T, options: SerializeOptions = {}) => {
  const newEditor = editor as T & SerializeEditor

  SERIALIZE_OPTIONS.set(newEditor, options)

  const { serializeText, serializeHtml } = newEditor

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

  newEditor.serializeHtml = (node: Node) => {
    if (Text.isText(node)) return escapeHtml(node.text)
    if (Editor.isEditor(node)) return node.children.map(newEditor.serializeHtml).join('')
    const { type, children } = node
    const html = children.map(newEditor.serializeHtml).join('')
    let tag = type ?? 'p'
    switch (type) {
      case 'paragraph':
        tag = 'p'
        break
    }
    return `<${tag}>${html}</${tag}>`
  }

  newEditor.deserializeHtml = (el: globalThis.Node, attributes = {}) => {
    if (el.nodeType === globalThis.Node.TEXT_NODE) {
      return jsx('text', attributes, el.textContent)
    }

    const nodeAttributes = { ...attributes }

    const children = Array.from(el.childNodes).map(node =>
      newEditor.deserializeHtml(node, nodeAttributes),
    )

    if (children.length === 0) {
      children.push(jsx('text', nodeAttributes, ''))
    }

    switch (el.nodeName) {
      case 'BODY':
        return jsx('fragment', {}, children)
      default:
        return jsx('element', { type: 'paragraph' }, children)
    }
  }

  return newEditor
}
