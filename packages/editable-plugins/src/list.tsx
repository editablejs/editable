import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor"
import { Editor, Transforms, Element, Node, Path, Range, NodeEntry } from "slate"
import { HeadingEditor } from "./heading"
import { Indent, IndentEditor } from "./indent"
import './list.less'

export const LIST_KEY = 'list'

interface ListNode {
  start: number
  listKey: string
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

interface FindListOptions { 
  path: Path, 
  listKey: string, 
  leval?: number
}

const findStartList = (editor: Editable, options: FindListOptions) => { 
  let { path, listKey, leval } = options
  let entry: NodeEntry<List> | undefined = undefined
  const match = (n: Node): n is List => isList(editor, n) && n.listKey === listKey 
  while(true) {
    const prev = Editor.previous<List>(editor, { 
      at: path,
      match
    })
    if(!prev) break
    const [list, p] = prev
    if(leval !== undefined && getLeval(editor, list) < leval) { 
      break
    }
    path = p
    entry = prev
  }
  if(!entry) {
    entry = Editor.above<List>(editor, {
      at: path,
      match: n => match(n) && (leval === undefined || getLeval(editor, n) === leval)
    })
    if(!entry) {
      const node = Node.get(editor, path)
      if(isList(editor, node)) {
        entry = [node, path]
      }
    }
  }
  return entry
}

const isStartList = (editor: Editable, options: FindListOptions) => { 
  const { path } = options
  const root = findStartList(editor, options)
  if(!root) return true
  return Path.equals(path, root[1])
}

type UpdateListStartOptions = FindListOptions & {
  mode?: 'all' | 'after'
  start?: number
}

const updateListStart = (editor: Editable, options: UpdateListStartOptions) => { 
  const { path, listKey, leval, mode = 'all', start } = options
  let startPath = path
  const startMap: Record<number, number> = {}
  if(start !== undefined) {
    startMap[leval ?? 0] = start
  }
  if(mode === 'all') {
    const startList = findStartList(editor, {
      path,
      listKey,
      leval
    })
    if(startList) {
      const [list, path] = startList
      startPath = path
      if(start === undefined) startMap[getLeval(editor, list)] = list.start + 1
    } 
  } else {
    const startList = Node.get(editor, path)
    if(isList(editor, startList) && start === undefined) startMap[getLeval(editor, startList)] = startList.start + 1
  }
  
  const levalOut = Number(Object.keys(startMap)[0])
  let prevLeval = levalOut
  while(true) {
    const next = Editor.next<List>(editor, {
      at: startPath,
      match: n => isList(editor, n) && n.listKey === listKey && (leval === undefined || getLeval(editor, n) === leval)
    })
    if(!next) break
    const [list, path] = next
    startPath = path
    const nextLeval = getLeval(editor, list)
    let start = startMap[nextLeval]
    if(!start || nextLeval > prevLeval) {
      start = startMap[nextLeval] = 1
    }
    
    prevLeval = nextLeval
    Transforms.setNodes<List>(editor, { start }, {
      at: startPath
    })
    startMap[nextLeval]++
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
      const elements = editor.queryActiveElements()[LIST_KEY] as NodeEntry<List>[]
      
      const startLists = new Map<string, NodeEntry<List>>()
      for(const [element, path] of elements) { 
        const { listKey } = element
        if(!startLists.has(listKey)) {
          const startList = findStartList(newEditor, {
            path,
            listKey,
            leval: getLeval(newEditor, element)
          }) ?? [element, path]
          startLists.set(listKey, startList)
        }
      }
      Transforms.unwrapNodes(editor, { 
        match: n => isList(editor, n),
        split: true,
      })
      const { selection } = editor
      if(!selection) return
      for(const [key, [list, path]] of startLists) {
        updateListStart(editor, {
          path,
          listKey: key,
          leval: getLeval(editor, list),
          start: list.start
        })
      }
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
      let listKey = ''
      let next = null
      let leval = 0
      if(prev) {
        const prevList = prev[0]
        listKey = prevList.listKey
        start = prevList.start + 1
        leval = getLeval(editor, prevList)
      } else if(next = Editor.above<List>(editor, {
        at: afterPath,
        match: n => isList(editor, n)
      })) {
        const nextList = next[0]
        listKey = nextList.listKey
        start = Math.max(nextList.start - 1, 1)
        leval = getLeval(editor, nextList)
      } else {
        listKey = Number(Math.random().toString().substring(2, 7) + Date.now()).toString(36)
      }
      let nextPath: Path = []
      for(const [_, path] of entrys) { 
        const element: List = { type: LIST_KEY, listKey, start, children: [] }
        Transforms.wrapNodes(editor, element, {
          at: path 
        })
        nextPath = path
        start++
      }
      if(nextPath.length > 0) {
        updateListStart(editor, {
          path: nextPath,
          listKey,
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
      const entry = Editor.above<List>(newEditor, { 
        match: n => isList(editor, n)
      })
      if(!entry) return onKeydown(e)
      e.preventDefault()
      const [list, path ] = entry
      if(Editable.isEmpty(newEditor, list)) {
        newEditor.toggleList()
        updateListStart(editor, {
          path,
          listKey: list.listKey,
          leval: getLeval(editor, list)
        })
        return
      }
      // here we need to insert a new paragraph
      const heading = Editor.above(newEditor, { match: n => HeadingEditor.isHeading(editor, n)})
      if(heading) {
        Transforms.insertNodes(newEditor, { type: '', children: [] }, { at: Path.next(path), select: true })
        return
      } 
      // split the current list
      Transforms.splitNodes(editor, { 
        match: n => isList(editor, n),
        always: true
      })
      updateListStart(editor, {
        path: selection.focus.path,
        listKey: list.listKey,
        leval: getLeval(editor, list)
      })
      return
    } else if(isHotkey('backspace', e)) { 
      const entry = Editor.above<List>(newEditor, { match: n => isList(editor, n)})
      if(entry) {
        let [list, path] = entry
        const { listKey } = list
        
        if(Editor.isStart(newEditor, selection.focus, path)) {
          const leval = getLeval(editor, list)
          const startList = findStartList(newEditor, {
            path,
            listKey,
            leval
          }) ?? entry
          Transforms.unwrapNodes<Indent>(newEditor, { 
            at: path 
          })
          Transforms.setNodes<Indent>(editor, { lineIndent: (list as Indent).lineIndent }, {
            at: path,
            mode: 'lowest',
            match: n => Editor.isBlock(editor, n)
          })
          updateListStart(editor, {
            path,
            listKey,
            leval,
            start: startList[0].start
          })
          return
        }
      }
    }
    onKeydown(e)
  }

  if(IndentEditor.isIndentEditor(newEditor)) {
    const { onIndentMatch, toggleIndent, toggleOutdent } = newEditor
    const toggleListIndent = (sub = false) => {
      const { selection } = newEditor
      const entry = Editor.above<List>(newEditor, { 
        at: selection?.anchor.path,
        match: n => isList(editor, n)
      })
      // 设置列表的缩进
      if(entry) { 
        let [list, path] = entry
        const { listKey } = list
        const leval = getLeval(editor, list)
        const isStart = isStartList(editor, {
          path,
          listKey
        })
        // 如果是列表的开头，则更新所有后代的缩进
        if(isStart) {
          IndentEditor.addLineIndent(newEditor, path, sub)
          let next: NodeEntry<List> | undefined = undefined
          while(true) {
            next = Editor.next(newEditor, { 
              at: path,
              match: n => isList(editor, n) && n.listKey === listKey
            })
            if(!next) break
            path = next[1]
            IndentEditor.addLineIndent(editor, path, sub)
          }
        } 
        // 非开头缩进
        else {
          // 减去缩进
          if(sub){
            toggleOutdent()
            updateListStart(editor, {
              path,
              listKey
            })
          } else {
            toggleIndent('line')
            const listEntries = Editor.nodes<List>(newEditor, {
              match: n => isList(newEditor, n)
            })
            let start = 1
            for(const [_, p] of listEntries) {
              Transforms.setNodes<List>(newEditor, { start }, {
                at: p,
              })
              start++
            }
            updateListStart(editor, {
              path,
              listKey
            })
          }
        }
      } else if(sub){
        toggleOutdent()
      }  
      else {
        toggleIndent()
      }
    }
    newEditor.toggleIndent = () => {
      toggleListIndent()
    }
    
    newEditor.toggleOutdent = () => { 
      toggleListIndent(true)
    }

    newEditor.onIndentMatch = (node: Node, path: Path) => {
      if(Editor.above(newEditor, { match: n => isList(editor, n), at: path })) { 
        return isList(editor, node)
      }
      return onIndentMatch(node, path)
    }
  }

  return newEditor
}