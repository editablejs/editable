import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor"
import { Editor, Transforms, Element, Node, Path, Range } from "slate"
import { HeadingEditor } from "./heading"
import { IndentEditor } from "./indent"
import './list.less'

export const LIST_KEY = 'list'

interface ListNode {
  start: number
  listid: string
}

export type List = Element & ListNode & Record<'type', 'list'>

export interface ListOptions {
}

export const LIST_OPTIONS = new WeakMap<Editable, ListOptions>()

export interface ListEditor extends Editable {

  toggleList: (start?: number) => void

}

export const ListEditor = {
  isListEditor: (editor: Editable): editor is ListEditor => { 
    return !!(editor as ListEditor).toggleList
  },

  isList: (editor: Editable, node: Node): node is List => { 
    return Editor.isBlock(editor, node) && node.type === LIST_KEY
  },

  queryActive: (editor: Editable) => {
    const elements = editor.queryActiveElements()
    const listEls = elements[LIST_KEY]
    return !!listEls && listEls.length > 0
  },

  getOptions: (editor: Editable): ListOptions => { 
    return LIST_OPTIONS.get(editor) ?? {}
  },

  toggle: (editor: ListEditor, start?: number) => { 
    editor.toggleList(start)
  }
}

export const isList = (editor: Editable, n: Node): n is List => {
  return Editor.isBlock(editor, n) && n.type === LIST_KEY
}

const getLeval = (editor: Editable, element: Element) => {
  const indentEditor = IndentEditor.isIndentEditor(editor)
  return indentEditor ? IndentEditor.getLeval(editor, element) : 0
}

const updateAfterStart = (editor: Editable, path: Path, options?: ListNode & Record<'leval', number>) => { 
  if(!options) {
    const entry = Editor.above<List>(editor, {
      at: path,
      match: n => isList(editor, n),
    })
    if(entry) {
      const listEl = entry[0]
      options = {
        listid: listEl.listid,
        start: listEl.start + 1,
        leval: getLeval(editor, listEl)
      }
    } else return
  }

  while(true) {
    const next = Editor.next<List>(editor, {
      at: path,
      match: n => isList(editor, n) && n.listid === options?.listid && getLeval(editor, n) === options?.leval
    })
    if(!next) break
    path = next[1]
    Transforms.setNodes<List>(editor, { start: options.start }, {
      at: path
    })
    options.start++
  }
}

const prefixCls = "editable-list"

const renderList = (editor: Editable, { attributes, element, children }: RenderElementProps, next: (props: RenderElementProps) => JSX.Element) => {
  if(isList(editor, element)) { 
    const { start = 1 } = element
    return <div className={`${prefixCls}`} {...attributes}>
      <span data-no-selection className={`${prefixCls}-label`}>{start}.</span>
      <div className={`${prefixCls}-contents`}>{children}</div>
    </div>
  }
  return next({ attributes, children, element })
}

export const withList = <T extends Editable>(editor: T, options: ListOptions = {}) => {
  const newEditor = editor as T & ListEditor
  
  newEditor.toggleList = (start: number = 1) => { 
    if(ListEditor.queryActive(editor)) {
      const elements = editor.queryActiveElements()[LIST_KEY] as List[]
      
      const updateStartMap = new Map<string, number>()
      const updateMap = new Map<string, number[]>()
      for(const element of elements) { 
        const { start, listid } = element
        const leval = getLeval(editor, element)
        if(!updateMap.has(listid)) { 
          updateMap.set(listid, [leval])
          updateStartMap.set(`${listid}_${leval}`, start)
        } else if(~~updateMap.get(listid)!.indexOf(leval)) {
          updateMap.get(listid)!.push(leval)
          updateStartMap.set(`${listid}_${leval}`, start)
        }
      }
      Transforms.unwrapNodes(editor, { 
        match: n => isList(editor, n),
        split: true,
      })
      const { selection } = editor
      if(!selection) return
      updateMap.forEach((levals, listid) => {
        levals.forEach(leval => { 
          const start = updateStartMap.get(`${listid}_${leval}`) ?? 0
          updateAfterStart(editor, selection.focus.path, {
            start,
            listid,
            leval
          })
        })
      })
    } else {
      const { selection } = editor
      if(!selection) return
      const entrys = Editor.nodes<Element>(editor, { 
        match: n => Editor.isBlock(editor, n),
        mode: 'lowest'
      })
      const beforePath = Editor.before(editor, selection.anchor.path)
      const afterPath = Editor.after(editor, selection.focus.path)
      const prev = Editor.above<List>(editor, {
        at: beforePath,
        match: n => isList(editor, n)
      })
      let listid = ''
      let next = null
      let leval = 0
      if(prev) {
        const prevList = prev[0]
        listid = prevList.listid
        start = prevList.start + 1
        leval = getLeval(editor, prevList)
      } else if(next = Editor.above<List>(editor, {
        at: afterPath,
        match: n => isList(editor, n)
      })) {
        const nextList = next[0]
        listid = nextList.listid
        start = Math.max(nextList.start - 1, 1)
        leval = getLeval(editor, nextList)
      } else {
        listid = Number(Math.random().toString().substring(2, 7) + Date.now()).toString(36)
      }
      let nextPath: Path = []
      for(const [_, path] of entrys) { 
        const element: List = { type: LIST_KEY, listid, start, children: [] }
        Transforms.wrapNodes(editor, element, {
          at: path 
        })
        nextPath = path
        start++
      }
      if(nextPath.length > 0) {
        updateAfterStart(editor, nextPath, {
          listid,
          start,
          leval
        })
      }
    }
  }

  const { renderElement } = newEditor

  newEditor.renderElement = (props) => {
    return renderList(newEditor, props, renderElement)
  }

  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    const { selection } = editor
    if(!selection || Range.isExpanded(selection) || !ListEditor.queryActive(editor) || isHotkey('shift+enter', e)) return onKeydown(e)
    if(isHotkey('enter', e)) {
      e.preventDefault()
      const entry = Editor.above(newEditor, { match: n => isList(editor, n)})
      if(entry && Editable.isEmpty(newEditor, entry[0])) {
        newEditor.toggleList()
        updateAfterStart(editor, entry[1])
        return
      }
      // here we need to insert a new paragraph
      const heading = Editor.above(newEditor, { match: n => HeadingEditor.isHeading(editor, n)})
      if(entry && heading) {
        Transforms.insertNodes(newEditor, { type: '', children: [{text: ''}] }, { at: Path.next(entry[1]), select: true })
        return
      } 
      // split the current list
      Transforms.splitNodes(editor, { 
        match: n => isList(editor, n),
        always: true
      })
      updateAfterStart(editor, selection.focus.path)
      return
    } else if(isHotkey('backspace', e)) { 
      const entry = Editor.above<List>(newEditor, { match: n => isList(editor, n)})
      let listEl: List | null = null
      let leval: number = 0
      if(entry && (listEl = entry[0]) && Editable.isEmpty(newEditor, listEl) && (leval = getLeval(editor, listEl)) === 0) {
        updateAfterStart(editor, entry[1], {
          listid: listEl.listid,
          start: listEl.start,
          leval
        })
      }
    }
    onKeydown(e)
  }

  if(IndentEditor.isIndentEditor(newEditor)) {
    const { onIndentMatch, toggleIndent } = newEditor
    newEditor.toggleIndent = () => {
      const listEl = Editor.above<List>(newEditor, { match: n => isList(editor, n)})
      if(listEl) { 
        const leval = getLeval(editor, listEl[0])
        if(leval === 0) {
          
        }
      }
      toggleIndent()
    }
    newEditor.onIndentMatch = (node: Node, path: Path) => {
      if(Editor.above(newEditor, { match: n => isList(editor, n) })) { 
        return isList(editor, node)
      }
      return onIndentMatch(node, path)
    }
  }

  return newEditor
}