import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor"
import { Editor, Transforms, Element, Node, Path, Range, NodeEntry } from "slate"
import { HeadingEditor } from "./heading"
import { Indent, IndentEditor } from "./indent"
import './list.less'
import { generateRandomKey } from "./utils"

export const LIST_KEY = 'list'

interface ListNode {
  start: number
  listKey: string
  leval: number
  kind?: string
}

export type List = Element & ListNode & Record<'type', 'list'>

export interface ListOptions {
  type?: string
  onRenderLabel?: (element: List) => JSX.Element
}

export const LIST_OPTIONS = new WeakMap<Editable, ListOptions>()

export interface ToggleListOptions {
  start?: number
  kind?: string
}
export interface ListEditor extends Editable {

  toggleList: (options?: ToggleListOptions) => void

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

  toggle: (editor: ListEditor, options?: ToggleListOptions) => { 
    editor.toggleList(options)
  },

  calcLeval: (editor: Editable, path: Path, key: string) => { 
    const [element] = Editor.nodes<Element>(editor, {
      at: path,
      match: n => Editor.isBlock(editor, n)
    })
    const prev = Editor.previous<List>(editor, { 
      at: path,
      match: n => ListEditor.isList(editor, n) && n.listKey === key
    })
    const prevIndentLeval = prev ? IndentEditor.getLeval(editor, prev[0] as Indent) : 0
    const prefixIndentLeval = prev ? (prevIndentLeval - prev[0].leval) : 0
    const elementIndentLeval = IndentEditor.getLeval(editor, element[0] as Indent)
    return elementIndentLeval - prefixIndentLeval
  }
}

interface FindListOptions { 
  path: Path, 
  listKey: string, 
  leval?: number
}

const findStartList = (editor: Editable, options: FindListOptions) => { 
  let { path, listKey, leval } = options
  let entry: NodeEntry<List> | undefined = undefined
  const match = (n: Node): n is List => ListEditor.isList(editor, n) && n.listKey === listKey 
  while(true) {
    const prev = Editor.previous<List>(editor, { 
      at: path,
      match
    })
    if(!prev) break
    const [list, p] = prev
    if(leval !== undefined && list.leval < leval) { 
      break
    }
    path = p
    entry = prev
  }
  if(!entry) {
    [entry] = Editor.nodes<List>(editor, {
      at: path,
      match: n => match(n) && (leval === undefined || n.leval === leval)
    })
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
      if(start === undefined) startMap[list.leval] = list.start + 1
    } 
  } else {
    const startList = Node.get(editor, path)
    if(ListEditor.isList(editor, startList) && start === undefined) startMap[startList.leval] = startList.start + 1
  }
  
  const levalOut = Number(Object.keys(startMap)[0])
  let prevLeval = levalOut
  while(true) {
    const next = Editor.next<List>(editor, {
      at: startPath,
      match: n => ListEditor.isList(editor, n) && n.listKey === listKey && (leval === undefined || n.leval === leval)
    })
    if(!next) break
    const [list, path] = next
    startPath = path
    const nextLeval = list.leval
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
  if(ListEditor.isList(editor, element)) { 
    const { start = 1 } = element
    const { onRenderLabel } = ListEditor.getOptions(editor)
    return <div className={`${prefixCls}`} {...attributes}>
      <span className={`${prefixCls}-label`}>{onRenderLabel ? onRenderLabel(element) : `${start}.`}</span>
      <div className={`${prefixCls}-contents`}>{children}</div>
    </div>
  }
  return next({ attributes, children, element })
}

export const withList = <T extends Editable>(editor: T, options: ListOptions = {}) => {
  const newEditor = editor as T & ListEditor

  LIST_OPTIONS.set(newEditor, options)
  
  newEditor.toggleList = (options = {}) => { 
    let { start = 1, kind } = options
    if(ListEditor.queryActive(editor)) {
      const elements = editor.queryActiveElements()[LIST_KEY] as NodeEntry<List>[]
      
      const startLists = new Map<string, NodeEntry<List>>()
      for(const [element, path] of elements) { 
        const { listKey } = element
        if(!startLists.has(listKey)) {
          const startList = findStartList(newEditor, {
            path,
            listKey,
            leval: element.leval
          }) ?? [element, path]
          startLists.set(listKey, startList)
        }
      }
      Transforms.unwrapNodes(editor, { 
        match: n => ListEditor.isList(editor, n),
        split: true,
      })
      const { selection } = editor
      if(!selection) return
      for(const [key, [list, path]] of startLists) {
        updateListStart(editor, {
          path,
          listKey: key,
          leval: list.leval,
          start: list.start
        })
        const indent = list as Indent
        Transforms.setNodes<Indent>(editor, { lineIndent: indent.lineIndent }, {
          at: path
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
      const [prev] = Editor.nodes<List>(editor, {
        at: beforePath,
        match: n => ListEditor.isList(editor, n)
      })
      let listKey = ''
      let next: NodeEntry<List> | undefined = undefined
      if(prev) {
        const prevList = prev[0]
        listKey = prevList.listKey
        start = prevList.start + 1
      } else if(([next] = Editor.nodes<List>(editor, {
        at: afterPath,
        match: n => ListEditor.isList(editor, n)
      })) && next) {
        const nextList = next[0]
        listKey = nextList.listKey
        start = Math.max(nextList.start - 1, 1)
      } else {
        listKey = generateRandomKey()
      }
      let nextPath: Path = []
      for(const [node, path] of entrys) { 
        const { lineIndent = 0, textIndent = 0 } = node as Indent
        const leval = ListEditor.calcLeval(editor, path, listKey)
        const element: List & Indent = { 
          type: LIST_KEY, 
          listKey, 
          start, 
          leval, 
          lineIndent: lineIndent + textIndent,
          kind, 
          children: [] 
        }
        Transforms.setNodes<Indent>(editor, { lineIndent: 0, textIndent: 0 }, {
          at: path
        })
        Transforms.wrapNodes(editor, element, {
          at: path 
        })
        nextPath = path
        start++
      }
      if(nextPath.length > 0) {
        updateListStart(editor, {
          path: nextPath,
          listKey
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
        match: n => ListEditor.isList(editor, n)
      })
      if(!entry) return onKeydown(e)
      e.preventDefault()
      const [list, path ] = entry
      if(Editable.isEmpty(newEditor, list)) {
        if(list.leval > 0) {
          Transforms.setNodes<List>(newEditor, { leval: list.leval - 1 }, {
            at: path
          })
          IndentEditor.addLineIndent(newEditor, path, true)
          updateListStart(editor, {
            path,
            listKey: list.listKey,
          })
        } else {
          newEditor.toggleList()
          updateListStart(editor, {
            path,
            listKey: list.listKey,
            leval: list.leval
          })
        }
        
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
        match: n => ListEditor.isList(editor, n),
        always: true
      })
      updateListStart(editor, {
        path: selection.focus.path,
        listKey: list.listKey,
        leval: list.leval
      })
      return
    } else if(isHotkey('backspace', e)) { 
      const entry = Editor.above<List>(newEditor, { match: n => ListEditor.isList(editor, n)})
      if(entry) {
        let [list, path] = entry
        const { listKey } = list
        
        if(Editor.isStart(newEditor, selection.focus, path)) {
          const startList = findStartList(newEditor, {
            path,
            listKey,
            leval: list.leval
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
            leval: list.leval,
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
        match: n => ListEditor.isList(editor, n)
      })
      // 设置列表的缩进
      if(entry) { 
        let [list, path] = entry
        const { listKey } = list
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
              match: n => ListEditor.isList(editor, n) && n.listKey === listKey
            })
            if(!next) break
            path = next[1]
            IndentEditor.addLineIndent(editor, path, sub)
            if(sub) {
              const leval = ListEditor.calcLeval(newEditor, path, listKey)
              Transforms.setNodes<List>(newEditor, { leval }, {
                at: path,
              })
            }
          }
          if(sub) {
            updateListStart(editor, {
              path,
              listKey
            })
          }
        } 
        // 非开头缩进
        else {
          // 减去缩进
          if(sub){
            toggleOutdent()
          } else {
            toggleIndent('line')
          }
          const listEntries = Editor.nodes<List>(newEditor, {
            match: n => ListEditor.isList(newEditor, n)
          })
          for(const [_, p] of listEntries) {
            const leval = ListEditor.calcLeval(newEditor, p, listKey)
            Transforms.setNodes<List>(newEditor, { leval }, {
              at: p,
            })
          }
          updateListStart(editor, {
            path,
            listKey
          })
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
      if(Editor.above(newEditor, { match: n => ListEditor.isList(editor, n), at: path })) { 
        return ListEditor.isList(editor, node)
      }
      return onIndentMatch(node, path)
    }
  }

  return newEditor
}