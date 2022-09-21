import { Editable, isHotkey } from '@editablejs/editor'
import { SerializeEditor } from '@editablejs/plugin-serializes'
import { List, ListEditor, ListTemplate, ToggleListOptions, withList } from './base'

type Hotkey = string | ((e: KeyboardEvent) => boolean)

const UNORDERED_LIST_KEY = 'unordered-list'

const defaultHotkey: Hotkey = 'mod+shift+8'

export interface UnOrderedListOptions {
  hotkey?: Hotkey
}

export interface ToggleUnOrderedListOptions extends Omit<ToggleListOptions, 'start'> {}

export interface UnOrdered extends List {
  type: typeof UNORDERED_LIST_KEY
}

export interface UnOrderedListEditor extends Editable {
  toggleUnOrderedList: (options?: ToggleUnOrderedListOptions) => void
}

export const UnOrderedListEditor = {
  isListEditor: (editor: Editable): editor is UnOrderedListEditor => {
    return !!(editor as UnOrderedListEditor).toggleUnOrderedList
  },

  isUnOrdered: (editor: Editable, value: any): value is UnOrdered => {
    return value && value.type === UNORDERED_LIST_KEY
  },

  queryActive: (editor: Editable) => {
    return ListEditor.queryActive(editor, UNORDERED_LIST_KEY)
  },

  toggle: (editor: UnOrderedListEditor, options?: ToggleUnOrderedListOptions) => {
    editor.toggleUnOrderedList(options)
  },
}

export const UnOrderedListTemplates: ListTemplate[] = [
  {
    key: 'default',
    depth: 3,
    render: ({ level }) => {
      const l = level % 3
      switch (l) {
        case 1:
          return { type: 'circle', text: `○` }
        case 2:
          return { type: 'square', text: `■` }
        default:
          return { type: 'disc', text: `●` }
      }
    },
  },
]

export const withUnOrderedList = <T extends Editable>(
  editor: T,
  options: UnOrderedListOptions = {},
) => {
  const hotkey = options.hotkey || defaultHotkey

  const e = editor as T & UnOrderedListEditor

  const newEditor = withList(e, UNORDERED_LIST_KEY)

  UnOrderedListTemplates.forEach(template => {
    ListEditor.addTemplate(newEditor, UNORDERED_LIST_KEY, template)
  })

  const { renderElement } = newEditor

  newEditor.renderElement = props => {
    const { element, attributes, children } = props
    if (ListEditor.isList(newEditor, element, UNORDERED_LIST_KEY)) {
      return ListEditor.render(newEditor, {
        props: {
          element,
          attributes,
          children,
        },
      })
    }
    return renderElement(props)
  }

  SerializeEditor.with(newEditor, e => {
    const { serializeHtml } = e
    e.serializeHtml = options => {
      const { node, attributes, styles = {} } = options
      if (UnOrderedListEditor.isUnOrdered(e, node)) {
        const { start, template } = node
        const listTemplate = ListEditor.getTemplate(
          newEditor,
          UNORDERED_LIST_KEY,
          template || UnOrderedListTemplates[0].key,
        )
        const label = listTemplate?.render({ ...node, start: 1 })
        const type = typeof label === 'string' ? label?.replace(/\.$/, '').trim() : label?.type
        const pl = styles['padding-left'] ?? '0px'
        delete styles['padding-left']
        return SerializeEditor.createHtml(
          'ul',
          { ...attributes, start, type },
          { ...styles, 'margin-left': pl },
          SerializeEditor.createHtml(
            'li',
            {},
            {},
            node.children.map(child => e.serializeHtml({ node: child })).join(''),
          ),
        )
      }
      return serializeHtml(options)
    }
  })

  newEditor.toggleUnOrderedList = (options?: ToggleUnOrderedListOptions) => {
    ListEditor.toggle(editor, UNORDERED_LIST_KEY, {
      ...options,
      template: options?.template ?? UnOrderedListTemplates[0].key,
    })
  }

  const { onKeydown } = newEditor

  newEditor.onKeydown = (e: KeyboardEvent) => {
    const toggle = () => {
      e.preventDefault()
      newEditor.toggleUnOrderedList()
    }
    if (
      (typeof hotkey === 'string' && isHotkey(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      toggle()
      return
    }
    onKeydown(e)
  }

  return newEditor
}
