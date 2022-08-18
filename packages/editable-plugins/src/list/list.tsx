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
  key: string
  level: number
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
    const activeElements = ListEditor.queryActive(editor, kind)
    Editor.withoutNormalizing(editor, () => {
      let { start = 1, template, values } = options
      if(activeElements) {
        const startLists = new Map<string, NodeEntry<List>>()
        for(const [element, path] of activeElements) { 
          const { key } = element
          if(!startLists.has(key)) {
            const startList = ListEditor.findStartList(editor, {
              path,
              key,
              level: element.level,
              kind
            }) ?? [element, path]
            startLists.set(key, startList)
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
            key: key,
            level: list.level,
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
        let key = ''
        let next: NodeEntry<List> | undefined = undefined
        if(prev) {
          const prevList = prev[0]
          key = prevList.key
          start = prevList.start + 1
        } else if(([next] = Editor.nodes<List>(editor, {
          at: afterPath,
          match: n => ListEditor.isList(editor, n, kind)
        })) && next) {
          const nextList = next[0]
          key = nextList.key
          start = Math.max(nextList.start - 1, 1)
        } else {
          key = generateRandomKey()
        }
        let nextPath: Path = []
        for(const [node, path] of entrys) { 
          const { lineIndent = 0, textIndent = 0 } = node as Indent
          const level = ListEditor.calcLeval(editor, kind, {path, key: key})
          const element: List & Indent = { 
            type: LIST_KEY,
            kind,
            key, 
            start, 
            level, 
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
              key: node.level > 0 ? node.key : element.key,
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
            key
          })
        }
      }
    })
  },

  addTemplate: (editor: ListEditor, kind: string, template: ListTemplate) => { 
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list = templates.get(kind) ?? []
    list.push(template)
    templates.set(kind, list)
    TEMPLATE_WEAKMAP.set(editor, templates)
  },

  getTemplates: (editor: ListEditor, kind: string, key: string) => { 
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list: ListTemplate[] = templates.get(kind) ?? []
    return list.find(t => t.key === key)
  },

  calcLeval: (editor: Editable, kind: string, options: {
    path: Path, 
    key: string
  }) => { 
    const { path, key } = options
    const [element] = Editor.nodes<Indent>(editor, {
      at: path,
      match: n => Editor.isBlock(editor, n) && (n as Indent).lineIndent !== undefined,
      mode: 'highest'
    })
    const prev = Editor.previous<List & Indent>(editor, { 
      at: path,
      match: n => ListEditor.isList(editor, n, kind) && n.key === key
    })
    const prevIndentLeval = prev ? IndentEditor.getLeval(editor, prev[0]) : 0
    const prefixIndentLeval = prev ? (prevIndentLeval - prev[0].level) : 0
    const elementIndentLeval = element ? IndentEditor.getLeval(editor, element[0]) : 0
    return elementIndentLeval - prefixIndentLeval
  },

  findStartList: (editor: Editable, options: FindListOptions, callback?: (list: NodeEntry<List>) => boolean) => { 
    let { path, key, level, kind } = options
    let entry: NodeEntry<List> | undefined = undefined
    const match = (n: Node): n is List => ListEditor.isList(editor, n, kind) && n.key === key 
    while(true) {
      const prev = Editor.previous<List>(editor, { 
        at: path,
        match
      })
      if(!prev) break
      const [list, p] = prev
      if(level !== undefined && list.level < level) { 
        break
      }
      path = p
      entry = prev
      if(callback && callback(entry)) break
    }
    if(!entry) {
      [entry] = Editor.nodes<List>(editor, {
        at: path,
        match: n => match(n) && (level === undefined || n.level === level)
      })
    }
    return entry
  }
}

interface FindListOptions { 
  path: Path, 
  key: string, 
  level?: number
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
  const { path, key, level, mode = 'all', start } = options
  let startPath = path
  const startMap: Record<number, number> = {}
  if(start !== undefined) {
    startMap[level ?? 0] = start
  }
  if(mode === 'all') {
    const startList = ListEditor.findStartList(editor, {
      path,
      key,
      level,
      kind
    })
    if(startList) {
      const [list, path] = startList
      startPath = path
      if(start === undefined) startMap[list.level] = list.start + 1
    } 
  } else {
    const startList = Node.get(editor, path)
    if(ListEditor.isList(editor, startList, kind) && start === undefined) startMap[startList.level] = startList.start + 1
  }
  
  const levelOut = Number(Object.keys(startMap)[0])
  let prevLeval = levelOut
  while(true) {
    const next = Editor.next<List>(editor, {
      at: startPath,
      match: n => ListEditor.isList(editor, n, kind) && n.key === key && (level === undefined || n.level === level)
    })
    if(!next) break
    const [list, path] = next
    startPath = path
    const nextLeval = list.level
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
  const { level } = element

  return <div className={`${prefixCls}${className ? ' ' + className : ''}`} data-list-level={level} {...attributes}>
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
        if(list.level > 0) {
          const level = list.level - 1
          const [startList] = ListEditor.findStartList(newEditor, {
            path,
            key: list.key,
            level,
          }, ([list]) => {
            return list.level === level
          })
          Transforms.setNodes<List>(newEditor, { 
            kind: startList.kind, 
            level,
          }, {
            at: path
          })
          IndentEditor.addLineIndent(newEditor, path, true)
          updateListStart(editor, kind, {
            path,
            key: list.key,
          })
          if(startList.kind !== kind)
          updateListStart(editor, startList.kind, {
            path,
            key: list.key,
          })
        } else {
          ListEditor.toggle(editor, kind)
          updateListStart(editor, kind, {
            path,
            key: list.key,
            level: list.level
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
        key: list.key,
        level: list.level
      })
      return
    } else if(isHotkey('backspace', e)) { 
      const entry = Editor.above<List>(newEditor, { match: n => ListEditor.isList(editor, n, kind)})
      if(entry) {
        let [list, path] = entry
        const { key } = list
        
        if(Editor.isStart(newEditor, selection.focus, path)) {
          if(Editable.isEmpty(newEditor, list) && list.level > 0 && IndentEditor.isIndentEditor(newEditor)) { 
            newEditor.toggleOutdent()
            return
          }
          const startList = ListEditor.findStartList(newEditor, {
            path,
            key,
            level: list.level,
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
            key,
            level: list.level,
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
        if(!IndentEditor.canSetIndent(newEditor, 'line')) {
          IndentEditor.insertIndent(newEditor)
          return
        } 
        let [list, path] = entry
        const { key } = list
        const isStart = isStartList(editor, {
          path,
          key,
          kind
        })
        // 如果是列表的开头，则更新所有后代的缩进
        if(isStart) {
          IndentEditor.addLineIndent(newEditor, path, sub)
          let next: NodeEntry<List> | undefined = undefined
          while(true) {
            next = Editor.next(newEditor, { 
              at: path,
              match: n => ListEditor.isList(editor, n, kind) && n.key === key
            })
            if(!next) break
            path = next[1]
            IndentEditor.addLineIndent(editor, path, sub)
            if(sub) {
              const level = ListEditor.calcLeval(newEditor, kind, {path, key: key})
              Transforms.setNodes<List>(newEditor, { level }, {
                at: path,
              })
            }
          }
          if(sub) {
            updateListStart(editor, kind, {
              path,
              key
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
            const level = ListEditor.calcLeval(newEditor, kind, {path: p, key: key})
            Transforms.setNodes<List>(newEditor, { level }, {
              at: p,
            })
          }
          updateListStart(editor, kind, {
            path,
            key
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