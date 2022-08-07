import { Editable, isHotkey } from "@editablejs/editor";
import React, { useLayoutEffect } from "react";
import { Path } from "slate";
import { List, ListEditor, ListTemplate, ToggleListOptions, withList } from "./list";
import './ordered.less'

type Hotkey = string | ((e: KeyboardEvent) => boolean)

const ORDERED_LIST_KEY = "ordered-list"

const defaultHotkey: Hotkey = 'mod+shift+7'

export interface OrderedListOptions {
  hotkey?: Hotkey
}

export interface ToggleOrderedListOptions extends ToggleListOptions {

}

export interface OrderedListEditor extends Editable {
  toggleOrderedList: (options?: ToggleOrderedListOptions) => void
}

export const OrderedListEditor = {
  isListEditor: (editor: Editable): editor is OrderedListEditor => { 
    return !!(editor as OrderedListEditor).toggleOrderedList
  },

  queryActive: (editor: Editable) => {
    return ListEditor.queryActive(editor, ORDERED_LIST_KEY)
  },

  toggle: (editor: OrderedListEditor, options?: ToggleOrderedListOptions) => { 
    editor.toggleOrderedList(options)
  },
}

const toABC = (num: number): string => {
  return num <= 26 ? String.fromCharCode(num + 64).toLowerCase() : toABC(~~((num - 1) / 26)) + toABC(num % 26 || 26);
}

const toRoman = (num: number) => {
  let map: Record<number, string> = {
    1: 'I',
    5: 'V',
    10: 'X',
    50: 'L',
    100: 'C',
    500: 'D',
    1000: 'M'
  }
  let digits = 1
  let result = ''
  while(num) {
      let current = num % 10
      if (current < 4) {
          result = map[digits].repeat(current) + result
      } else if (current === 4) {
          result = map[digits] + map[digits * 5] + result
      } else if (current > 4 && current < 9) {
          result = map[digits * 5] + map[digits].repeat(current - 5) + result
      } else {
          result = map[digits] + map[digits * 10] + result
      }
      digits *= 10
      num = Math.trunc(num/10)
  }
  return result
};

const prefixCls = 'editable-ordered-list'

export const OrderedListTemplates: ListTemplate[] = [
  {
    key: 'default',
    depth: 3,
    render: ({ start, leval }: List) => {
      const l = leval % 3
      switch(l) { 
        case 1: return `${toABC(start)}.`
        case 2: return `${toRoman(start)}.`
        default:
          return `${start}.`
      }
    }
  }
]

const LabelElement = ({ editor, element, template = OrderedListTemplates[0]}: { editor: Editable, element: List, template?: ListTemplate }) => { 
  const { leval, listKey } = element
  const ref = React.useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const { current: label } = ref
    if(leval % template.depth > 0 && label) { 
      const path = Editable.findPath(editor, element)
      const [start, startPath] = ListEditor.findStartList(editor, {
        path,
        listKey,
        leval,
        kind: ORDERED_LIST_KEY
      })
      if(Path.equals(path, startPath)) return
      const startDom = Editable.toDOMNode(editor, start)
      const startLabel = startDom.querySelector(`.${prefixCls}-label`)
      if(startLabel) {
        const { width: startWidth } = startLabel.getBoundingClientRect()
        const { width } = label.getBoundingClientRect()
        if(width > startWidth) {
          label.style.marginLeft = `-${width - startWidth + 28}px`
        } 
        // else if(startWidth > width) {
        //   label.style.marginLeft = `-${28 - (startWidth - width)}px`
        // } 
        else {
          label.style.marginLeft = ''
        }
      }
    } else if(label) {
      label.style.marginLeft = ''
    }
  }, [editor, element, leval, listKey, template.depth])

  return <span ref={ref} className={`${prefixCls}-label`}>{template.render(element)}</span>
}

export const withOrderedList = <T extends Editable>(editor: T, options: OrderedListOptions = {}) => { 
  const hotkey = options.hotkey || defaultHotkey

  const e = editor as  T & OrderedListEditor

  const newEditor = withList(e, { 
    kind: ORDERED_LIST_KEY,
    className: prefixCls,
    onRenderLabel: (element, template) => { 
      return <LabelElement element={element} editor={newEditor} template={template} />
    }
  });

  OrderedListTemplates.forEach(template => {
    ListEditor.addTemplate(newEditor, ORDERED_LIST_KEY, template)
  })

  newEditor.toggleOrderedList = (options?: ToggleOrderedListOptions) => { 
    ListEditor.toggle(editor, ORDERED_LIST_KEY,{
      ...options,
      template: options?.template ?? OrderedListTemplates[0].key
    })
  }

  const { onKeydown } = newEditor

  newEditor.onKeydown = (e: KeyboardEvent) => { 
    const toggle = () => {
      e.preventDefault()
      newEditor.toggleOrderedList()
    }
    if(typeof hotkey === 'string' && isHotkey(hotkey, e) || typeof hotkey === 'function' && hotkey(e)) {
      toggle()
      return
    }
    onKeydown(e)
  }

  return newEditor
}