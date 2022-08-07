import { Editable, isHotkey, RenderElementProps } from "@editablejs/editor"
import React from 'react'
import { Editor, Transforms, Element, Node, Path, Range, NodeEntry } from "slate"
import { HeadingEditor } from "../heading"
import { Indent, IndentEditor, IndentMode } from "../indent"
import { generateRandomKey } from "../utils"
import './list.less'

interface ListNode {
  kind: string
  start: number
  listKey: string
  leval: number
  template?: string
}

export const LIST_KEY = 'list'

export type List = Element & ListNode & Record<'type', 'list'>

export interface ListOptions {
  kind: string
  className?: string
  onRenderLabel?: (element: List, template?: ListTemplate) => React.ReactNode
}

export interface ToggleListOptions {
  start?: number
  template?: string
  values?: Record<string, any>
}
export interface ListEditor extends Editable {

}

export interface ListTemplate { 
  key: string
  depth: number
  render: (element: List) => React.ReactNode
}

const TEMPLATE_WEAKMAP = new WeakMap<Editable, Map<string, ListTemplate[]>>()

export const ListEditor = {

  isList: (editor: Editable, node: Node, kind?: string): node is List => { 
    return Editor.isBlock(editor, node) && node.type === LIST_KEY && (kind === undefined || (node as List).kind === kind)
  },

  queryActive: (editor: Editable, kind?: string) => {
    const elements = editor.queryActiveElements()
    const entries = (elements[LIST_KEY] ?? []) as NodeEntry<List>[]
    const kindEntries = kind ? entries.filter(e => e[0].kind === kind) : entries
    if(kindEntries.length === 0) return null
    return kindEntries
  },

  toggle: (editor: ListEditor, kind: string, options: ToggleListOptions = {}) => { 
    let { start = 1, template, values } = options
    const activeElements = ListEditor.queryActive(editor, kind)
    if(activeElements) {
      const startLists = new Map<string, NodeEntry<List>>()
      for(const [element, path] of activeElements) { 
        const { listKey } = element
        if(!startLists.has(listKey)) {
          const startList = ListEditor.findStartList(editor, {
            path,
            listKey,
            leval: element.leval,
            kind
          }) ?? [element, path]
          startLists.set(listKey, startList)
        }
      }
      Transforms.unwrapNodes(editor, { 
        match: n => ListEditor.isList(editor, n, kind),
        split: true,
      })
      const { selection } = editor
      if(!selection) return
      for(const [key, [list, path]] of startLists) {
        updateListStart(editor, kind, {
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
        match: n => ListEditor.isList(editor, n, kind)
      })
      let listKey = ''
      let next: NodeEntry<List> | undefined = undefined
      if(prev) {
        const prevList = prev[0]
        listKey = prevList.listKey
        start = prevList.start + 1
      } else if(([next] = Editor.nodes<List>(editor, {
        at: afterPath,
        match: n => ListEditor.isList(editor, n, kind)
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
        const leval = ListEditor.calcLeval(editor, kind, {path, key: listKey})
        const element: List & Indent = { 
          type: LIST_KEY,
          kind,
          listKey, 
          start, 
          leval, 
          lineIndent: lineIndent + textIndent,
          template,
          ...values,
          children: [] 
        }
        let list: NodeEntry<List> | undefined = undefined
        if(ListEditor.isList(editor, node) || (list = Editor.above(editor, {
          at: path,
          match: n => ListEditor.isList(editor, n)
        }))) {
          const node = list ? list[0] : element
          Transforms.setNodes(editor, {
            ...element,
            listKey: node.leval > 0 ? node.listKey : element.listKey,
            lineIndent: (node as Indent).lineIndent
          }, {
            at: list ? list[1] : path
          })
        } else {
          Transforms.setNodes<Indent>(editor, { lineIndent: 0, textIndent: 0 }, {
            at: path
          })
          Transforms.wrapNodes(editor, element, {
            at: path 
          })
        }
        nextPath = path
        start++
      }
      if(nextPath.length > 0) {
        updateListStart(editor, kind, {
          path: nextPath,
          listKey
        })
      }
    }
  },

  addTemplate: (editor: ListEditor, kind: string, template: ListTemplate) => { 
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list = templates.get(kind) ?? []
    list.push(template)
    templates.set(kind, list)
    TEMPLATE_WEAKMAP.set(editor, templates)
  },

  getTemplates: (editor: ListEditor, kind: string, key: string): ListTemplate => { 
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list: ListTemplate[] = templates.get(kind) ?? []
    const template = list.find(t => t.key === key)
    if(!template) throw new Error(`template not found: ${template}`)
    return template
  },

  calcLeval: (editor: Editable, kind: string, options: {
    path: Path, 
    key: string
  }) => { 
    const { path, key } = options
    const [element] = Editor.nodes<Element>(editor, {
      at: path,
      match: n => Editor.isBlock(editor, n)
    })
    const prev = Editor.previous<List>(editor, { 
      at: path,
      match: n => ListEditor.isList(editor, n, kind) && n.listKey === key
    })
    const prevIndentLeval = prev ? IndentEditor.getLeval(editor, prev[0] as Indent) : 0
    const prefixIndentLeval = prev ? (prevIndentLeval - prev[0].leval) : 0
    const elementIndentLeval = IndentEditor.getLeval(editor, element[0] as Indent)
    return elementIndentLeval - prefixIndentLeval
  },

  findStartList: (editor: Editable, options: FindListOptions, callback?: (list: NodeEntry<List>) => boolean) => { 
    let { path, listKey, leval, kind } = options
    let entry: NodeEntry<List> | undefined = undefined
    const match = (n: Node): n is List => ListEditor.isList(editor, n, kind) && n.listKey === listKey 
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
      if(callback && callback(entry)) break
    }
    if(!entry) {
      [entry] = Editor.nodes<List>(editor, {
        at: path,
        match: n => match(n) && (leval === undefined || n.leval === leval)
      })
    }
    return entry
  }
}

interface FindListOptions { 
  path: Path, 
  listKey: string, 
  leval?: number
  kind?: string
}

const isStartList = (editor: Editable, options: FindListOptions) => { 
  const { path } = options
  const root = ListEditor.findStartList(editor, options)
  if(!root) return true
  return Path.equals(path, root[1])
}

type UpdateListStartOptions = FindListOptions & {
  mode?: 'all' | 'after'
  start?: number
}

const updateListStart = (editor: Editable, kind: string, options: UpdateListStartOptions) => { 
  const { path, listKey, leval, mode = 'all', start } = options
  let startPath = path
  const startMap: Record<number, number> = {}
  if(start !== undefined) {
    startMap[leval ?? 0] = start
  }
  if(mode === 'all') {
    const startList = ListEditor.findStartList(editor, {
      path,
      listKey,
      leval,
      kind
    })
    if(startList) {
      const [list, path] = startList
      startPath = path
      if(start === undefined) startMap[list.leval] = list.start + 1
    } 
  } else {
    const startList = Node.get(editor, path)
    if(ListEditor.isList(editor, startList, kind) && start === undefined) startMap[startList.leval] = startList.start + 1
  }
  
  const levalOut = Number(Object.keys(startMap)[0])
  let prevLeval = levalOut
  while(true) {
    const next = Editor.next<List>(editor, {
      at: startPath,
      match: n => ListEditor.isList(editor, n, kind) && n.listKey === listKey && (leval === undefined || n.leval === leval)
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

const ListElement = ({ element, attributes, children, onRenderLabel, className }: RenderElementProps<List> & {onRenderLabel: (element: List) => React.ReactNode, className?: string }) => { 
  const { leval } = element

  return <div className={`${prefixCls}${className ? ' ' + className : ''}`} data-list-leval={leval} {...attributes}>
    <span className={`${prefixCls}-label`}>{onRenderLabel(element)}</span>
    <div className={`${prefixCls}-contents`}>{children}</div>
  </div>
}

export const withList = <T extends Editable>(editor: T, options: ListOptions) => {
  const newEditor = editor as T & ListEditor

  const { kind, onRenderLabel, className } = options

  const { renderElement } = newEditor

  newEditor.renderElement = ({ element, attributes, children }) => {
    
    if(ListEditor.isList(editor, element, kind)) { 
      
      const renderLabel = () => {
        const { template: key, kind, start } = element
        const template = key ? ListEditor.getTemplates(newEditor, kind, key) : undefined
        if(onRenderLabel) return onRenderLabel(element, template)
        return template ? template.render(element) : `${start}.`
      }
      return <ListElement element={element} attributes={attributes} onRenderLabel={renderLabel} className={className}>{children}</ListElement>
    }
    return renderElement({ attributes, children, element })
  }

  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    const { selection } = editor
    if(!selection || Range.isExpanded(selection) || !ListEditor.queryActive(editor, kind) || isHotkey('shift+enter', e)) return onKeydown(e)
    if(isHotkey('enter', e)) {
      const entry = Editor.above<List>(newEditor, { 
        match: n => ListEditor.isList(editor, n, kind)
      })
      if(!entry) return onKeydown(e)
      e.preventDefault()
      const [list, path ] = entry
      if(Editable.isEmpty(newEditor, list)) {
        if(list.leval > 0) {
          const leval = list.leval - 1
          const [startList] = ListEditor.findStartList(newEditor, {
            path,
            listKey: list.listKey,
            leval,
          }, ([list]) => {
            return list.leval === leval
          })
          Transforms.setNodes<List>(newEditor, { 
            kind: startList.kind, 
            leval,
          }, {
            at: path
          })
          IndentEditor.addLineIndent(newEditor, path, true)
          updateListStart(editor, kind, {
            path,
            listKey: list.listKey,
          })
          if(startList.kind !== kind)
          updateListStart(editor, startList.kind, {
            path,
            listKey: list.listKey,
          })
        } else {
          ListEditor.toggle(editor, kind)
          updateListStart(editor, kind, {
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
        match: n => ListEditor.isList(editor, n, kind),
        always: true
      })
      updateListStart(editor, kind, {
        path: selection.focus.path,
        listKey: list.listKey,
        leval: list.leval
      })
      return
    } else if(isHotkey('backspace', e)) { 
      const entry = Editor.above<List>(newEditor, { match: n => ListEditor.isList(editor, n, kind)})
      if(entry) {
        let [list, path] = entry
        const { listKey } = list
        
        if(Editor.isStart(newEditor, selection.focus, path)) {
          if(Editable.isEmpty(newEditor, list) && list.leval > 0 && IndentEditor.isIndentEditor(newEditor)) { 
            newEditor.toggleOutdent()
            return
          }
          const startList = ListEditor.findStartList(newEditor, {
            path,
            listKey,
            leval: list.leval,
            kind
          }) ?? entry
          Transforms.unwrapNodes<Indent>(newEditor, { 
            at: path 
          })
          Transforms.setNodes<Indent>(editor, { lineIndent: (list as Indent).lineIndent }, {
            at: path,
            mode: 'lowest',
            match: n => Editor.isBlock(editor, n)
          })
          updateListStart(editor, kind, {
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
    const toggleListIndent = (mode: IndentMode = "auto",sub = false) => {
      const { selection } = newEditor
      const entry = Editor.above<List>(newEditor, { 
        at: selection?.anchor.path,
        match: n => ListEditor.isList(editor, n, kind)
      })
      // 设置列表的缩进
      if(entry) { 
        let [list, path] = entry
        const { listKey } = list
        const isStart = isStartList(editor, {
          path,
          listKey,
          kind
        })
        // 如果是列表的开头，则更新所有后代的缩进
        if(isStart) {
          IndentEditor.addLineIndent(newEditor, path, sub)
          let next: NodeEntry<List> | undefined = undefined
          while(true) {
            next = Editor.next(newEditor, { 
              at: path,
              match: n => ListEditor.isList(editor, n, kind) && n.listKey === listKey
            })
            if(!next) break
            path = next[1]
            IndentEditor.addLineIndent(editor, path, sub)
            if(sub) {
              const leval = ListEditor.calcLeval(newEditor, kind, {path, key: listKey})
              Transforms.setNodes<List>(newEditor, { leval }, {
                at: path,
              })
            }
          }
          if(sub) {
            updateListStart(editor, kind, {
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
            match: n => ListEditor.isList(newEditor, n, kind)
          })
          for(const [_, p] of listEntries) {
            const leval = ListEditor.calcLeval(newEditor, kind, {path: p, key: listKey})
            Transforms.setNodes<List>(newEditor, { leval }, {
              at: p,
            })
          }
          updateListStart(editor, kind, {
            path,
            listKey
          })
        }
      } else if(sub){
        toggleOutdent()
      }  
      else {
        toggleIndent(mode)
      }
    }
    newEditor.toggleIndent = (mode?: IndentMode) => {
      toggleListIndent(mode)
    }
    
    newEditor.toggleOutdent = (mode?: IndentMode) => { 
      toggleListIndent(mode, true)
    }

    newEditor.onIndentMatch = (node: Node, path: Path) => {
      if(ListEditor.isList(editor, node, kind) || Editor.above(newEditor, { match: n => ListEditor.isList(editor, n, kind), at: path })) { 
        return ListEditor.isList(editor, node, kind)
      }
      return onIndentMatch(node, path)
    }
  }

  return newEditor
}