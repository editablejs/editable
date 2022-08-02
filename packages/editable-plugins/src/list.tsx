import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor"
import { Editor, Transforms, Element, Node, Path, Range } from "slate"
import { isIndentEditor } from "./indent"
import './list.less'

export const LIST_KEY = 'list'

interface ListNode {
  start: number
  leval: number
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

const updateNextStart = (editor: Editable, path: Path, ...nodes: ListNode[]) => { 
  if(nodes.length === 0) {
    const entry = Editor.above<ListElement>(editor, {
      at: path,
      match: n => isList(editor, n),
    })
    if(entry) {
      const listEl = entry[0]
      nodes = [{
        listid: listEl.listid,
        start: listEl.start + 1,
        leval: listEl.leval
      }]
    } else return
  }

  while(true) {
    let currentList: ListNode | undefined = undefined
    const next = Editor.next<ListElement>(editor, {
      at: path,
      match: n => {
        if(!isList(editor, n)) return false
        currentList = nodes!.find(node => n.listid === n.listid && n.leval === node.leval)
        return !!currentList
      }
    })
    if(!next || !currentList) break
    const list = currentList as ListNode
    path = next[1]
    Transforms.setNodes<ListElement>(editor, { start: list.start }, {
      at: path
    })
    list.start++
  }
}

const toggleList = (editor: ListInterface, start = 1) => {
  let endPath: Path = []
  let listid = ''
  let next = null
  let leval = 0
  if(editor.queryListActive()) {
    const elements = editor.queryActiveElements()[LIST_KEY] as ListElement[]
    const firstList = elements[0]
    start = firstList.start
    const lastList = elements[elements.length - 1]
    listid = lastList.listid
    leval = lastList.leval
    Transforms.unwrapNodes(editor, { 
      match: n => isList(editor, n),
      split: true,
    })
    if(firstList.listid !== lastList.listid) {
      updateNextStart(editor, endPath, {
        ...firstList
      })
    }
    endPath = editor.selection?.focus.path ?? []
  } else {
    const entrys = Editor.nodes<Element>(editor, { 
      match: n => Editor.isBlock(editor, n),
      mode: 'lowest'
    })
    const prev = Editor.previous<ListElement>(editor, {
      match: n => isList(editor, n),
    })
    if(prev) {
      const prevList = prev[0]
      listid = prevList.listid
      start = prevList.start + 1
      leval = prevList.leval
    } else if(next = Editor.next<ListElement>(editor, {
      match: n => isList(editor, n),
    })) {
      const nextList = next[0]
      listid = nextList.listid
      start = Math.max(nextList.start - 1, 1)
      leval = nextList.leval
    } else {
      listid = Number(Math.random().toString().substring(2, 7) + Date.now()).toString(36)
    }
    const indentEditor = isIndentEditor(editor)
    for(const [block, path] of entrys) { 
      const leval = indentEditor ? editor.getIndentLeval(block) : 0
      const element: ListElement = { type: LIST_KEY, listid, start, leval, children: [] }
      Transforms.wrapNodes(editor, element, {
        at: path 
      })
      endPath = path
      start++
    }
  }
  if(endPath.length > 0) {
    updateNextStart(editor, endPath, {
      listid,
      start,
      leval
    })
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

      Transforms.splitNodes(editor, { 
        match: n => isList(editor, n),
        always: true
      })
      updateNextStart(editor, selection.focus.path)
      return
    }
    onKeydown(e)
  }

  return newEditor
}