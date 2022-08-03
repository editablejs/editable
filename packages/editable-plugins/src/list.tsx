import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor"
import { Editor, Transforms, Element, Node, Path, Range } from "slate"
import { isHeading } from "./heading"
import { isIndentEditor } from "./indent"
import './list.less'

export const LIST_KEY = 'list'

interface ListNode {
  start: number
  listid: string
}

export type ListElement = Element & ListNode & Record<'type', 'list'>

export interface ListOptions {
}

export interface ListInterface extends Editable {

  toggleList: (start?: number) => void

  queryListActive: () => boolean
}

export const isList = (editor: Editable, n: Node): n is ListElement => {
  return Editor.isBlock(editor, n) && n.type === LIST_KEY
}

const getLeval = (editor: Editable, element: Element) => {
  const indentEditor = isIndentEditor(editor)
  return indentEditor ? editor.getIndentLeval(element) : 0
}

const updateNextStart = (editor: Editable, path: Path, options?: ListNode & Record<'leval', number>) => { 
  if(!options) {
    const entry = Editor.above<ListElement>(editor, {
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
    const next = Editor.next<ListElement>(editor, {
      at: path,
      match: n => isList(editor, n) && n.listid === options?.listid && getLeval(editor, n) === options?.leval
    })
    if(!next) break
    path = next[1]
    Transforms.setNodes<ListElement>(editor, { start: options.start }, {
      at: path
    })
    options.start++
  }
}

const toggleList = (editor: ListInterface, start = 1) => {
  if(editor.queryListActive()) {
    const elements = editor.queryActiveElements()[LIST_KEY] as ListElement[]
    
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
        updateNextStart(editor, selection.focus.path, {
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
    const prev = Editor.above<ListElement>(editor, {
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
    } else if(next = Editor.above<ListElement>(editor, {
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
      const element: ListElement = { type: LIST_KEY, listid, start, children: [] }
      Transforms.wrapNodes(editor, element, {
        at: path 
      })
      nextPath = path
      start++
    }
    if(nextPath.length > 0) {
      updateNextStart(editor, nextPath, {
        listid,
        start,
        leval
      })
    }
  }
}

const queryListActive = (editor: Editable) => {
  const elements = editor.queryActiveElements()
  const listEls = elements[LIST_KEY]
  return !!listEls && listEls.length > 0
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
  const newEditor = editor as T & ListInterface
  
  newEditor.toggleList = (start?: number) => { 
    toggleList(newEditor, start)
  }

  newEditor.queryListActive = () => { 
    return queryListActive(editor)
  }

  const { renderElement } = newEditor

  newEditor.renderElement = (props) => {
    return renderList(newEditor, props, renderElement)
  }

  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    const { selection } = editor
    if(!selection || Range.isExpanded(selection) || !newEditor.queryListActive() || isHotkey('shift+enter', e)) return onKeydown(e)
    if(isHotkey('enter', e)) {
      e.preventDefault()
      const entry = Editor.above(newEditor, { match: n => isList(editor, n)})
      if(entry && Editable.isEmpty(newEditor, entry[0])) {
        newEditor.toggleList()
        updateNextStart(editor, entry[1])
        return
      }
      // here we need to insert a new paragraph
      const heading = Editor.above(newEditor, { match: n => isHeading(editor, n)})
      if(entry && heading) {
        Transforms.insertNodes(newEditor, { type: '', children: [{text: ''}] }, { at: Path.next(entry[1]), select: true })
        return
      } 
      // split the current list
      Transforms.splitNodes(editor, { 
        match: n => isList(editor, n),
        always: true
      })
      updateNextStart(editor, selection.focus.path)
      return
    } else if(isHotkey('backspace', e)) { 
      const entry = Editor.above<ListElement>(newEditor, { match: n => isList(editor, n)})
      let listEl: ListElement | null = null
      let leval: number = 0
      if(entry && (listEl = entry[0]) && Editable.isEmpty(newEditor, listEl) && (leval = getLeval(editor, listEl)) === 0) {
        updateNextStart(editor, entry[1], {
          listid: listEl.listid,
          start: listEl.start,
          leval
        })
      }
    }
    onKeydown(e)
  }

  return newEditor
}