import {
  Editable,
  isHotkey,
  RenderElementProps,
  Editor,
  Transforms,
  Element,
  Node,
  Path,
  Range,
  NodeEntry,
  generateRandomKey,
} from '@editablejs/editor'
import React from 'react'
import { HeadingEditor } from '@editablejs/plugin-heading'
import { Indent, IndentEditor, IndentMode } from '@editablejs/plugin-indent'
import tw, { styled } from 'twin.macro'
import { StyledComponent } from 'styled-components'

interface ListNode {
  start: number
  key: string
  level: number
  template?: string
}

export const LIST_KEY = 'list'

export type List = Element & ListNode & Record<'type', string>

export interface ToggleListOptions {
  start?: number
  template?: string
  values?: Record<string, any>
}
export interface ListEditor extends Editable {
  isList: (value: any, type?: string) => value is List
}

export interface ListTemplate {
  key: string
  depth: number
  render: (element: Omit<List, 'children'>) => string | Record<'type' | 'text', string>
}

const TEMPLATE_WEAKMAP = new WeakMap<Editable, Map<string, ListTemplate[]>>()

export interface RenderListOptions {
  props: RenderElementProps<List>
  StyledList?: StyledComponent<'div', any>
  onRenderLabel?: (element: List, template?: ListTemplate) => React.ReactNode
}

export const ListEditor = {
  isListEditor: (editor: Editor): editor is ListEditor => {
    return !!(editor as ListEditor).isList
  },

  isList: <T extends List>(editor: Editor, node: any, type?: string): node is T => {
    return ListEditor.isListEditor(editor) && editor.isList(node, type)
  },

  queryActive: (editor: Editable, type?: string) => {
    const elements = editor.queryActiveElements()
    const entries = (elements[type ?? LIST_KEY] ?? []) as NodeEntry<List>[]
    const kindEntries = type ? entries.filter(e => e[0].type === type) : entries
    if (kindEntries.length === 0) return null
    return kindEntries
  },

  render: (editor: ListEditor, options: RenderListOptions) => {
    const {
      props: { element, attributes, children },
      StyledList,
      onRenderLabel,
    } = options
    const renderLabel = () => {
      const { template: key, type, start } = element
      const template = key ? ListEditor.getTemplate(editor, type, key) : undefined
      if (onRenderLabel) return onRenderLabel(element, template)
      const result = template ? template.render(element) : `${start}.`
      return typeof result === 'object' ? result.text : result
    }

    return (
      <ListElement
        StyledList={StyledList}
        element={element}
        attributes={attributes}
        onRenderLabel={renderLabel}
      >
        {children}
      </ListElement>
    )
  },

  toggle: (editor: Editable, type: string, options: ToggleListOptions = {}) => {
    const activeElements = ListEditor.queryActive(editor, type)
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      let { start = 1, template, values } = options
      if (activeElements) {
        const startLists = new Map<string, NodeEntry<List>>()
        for (const [element, path] of activeElements) {
          const { key } = element
          if (!startLists.has(key)) {
            const startList = ListEditor.findStartList(editor, {
              path,
              key,
              level: element.level,
              type,
            }) ?? [element, path]
            startLists.set(key, startList)
          }
        }
        Transforms.unwrapNodes(editor, {
          match: n => ListEditor.isList(editor, n, type),
          split: true,
        })
        const { selection } = editor
        if (!selection) return
        for (const [key, [list, path]] of startLists) {
          updateListStart(editor, type, {
            path,
            key: key,
            level: list.level,
            start: list.start,
          })
          const indent = list as Indent
          Transforms.setNodes<Indent>(
            editor,
            { lineIndent: indent.lineIndent },
            {
              at: path,
            },
          )
        }
      } else {
        const { selection } = editor
        if (!selection) return
        const entrys = Editor.nodes<Element>(editor, {
          match: n => Editor.isBlock(editor, n),
          mode: 'lowest',
        })
        const beforePath = Editor.before(editor, selection.anchor.path)
        const afterPath = Editor.after(editor, selection.focus.path)
        const [prev] = Editor.nodes<List>(editor, {
          at: beforePath,
          match: n => ListEditor.isList(editor, n, type),
        })
        let key = ''
        let next: NodeEntry<List> | undefined = undefined
        if (prev) {
          const prevList = prev[0]
          key = prevList.key
          start = prevList.start + 1
        } else if (
          ([next] = Editor.nodes<List>(editor, {
            at: afterPath,
            match: n => ListEditor.isList(editor, n, type),
          })) &&
          next
        ) {
          const nextList = next[0]
          key = nextList.key
          start = Math.max(nextList.start - 1, 1)
        } else {
          key = generateRandomKey()
        }
        let nextPath: Path = []
        for (const [node, path] of entrys) {
          const { lineIndent = 0, textIndent = 0 } = node as Indent
          const level = ListEditor.calcLeval(editor, type, { path, key: key })
          const element: List & Indent = {
            type,
            key,
            start,
            level,
            lineIndent: lineIndent + textIndent,
            template,
            ...values,
            children: [],
          }
          let list: NodeEntry<List> | undefined = undefined
          if (
            ListEditor.isList(editor, node) ||
            (list = Editor.above(editor, {
              at: path,
              match: n => ListEditor.isList(editor, n),
            }))
          ) {
            const node = list ? list[0] : element
            Transforms.setNodes(
              editor,
              {
                ...element,
                key: node.level > 0 ? node.key : element.key,
                lineIndent: (node as Indent).lineIndent,
              },
              {
                at: list ? list[1] : path,
              },
            )
          } else {
            Transforms.setNodes<Indent>(
              editor,
              { lineIndent: 0, textIndent: 0 },
              {
                at: path,
              },
            )
            Transforms.wrapNodes(editor, element, {
              at: path,
            })
          }
          nextPath = path
          start++
        }
        if (nextPath.length > 0) {
          updateListStart(editor, type, {
            path: nextPath,
            key,
          })
        }
      }
    })
  },

  addTemplate: (editor: ListEditor, type: string, template: ListTemplate) => {
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list = templates.get(type) ?? []
    list.push(template)
    templates.set(type, list)
    TEMPLATE_WEAKMAP.set(editor, templates)
  },

  getTemplate: (editor: ListEditor, type: string, key: string) => {
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list: ListTemplate[] = templates.get(type) ?? []
    return list.find(t => t.key === key)
  },

  calcLeval: (
    editor: Editable,
    type: string,
    options: {
      path: Path
      key: string
    },
  ) => {
    const { path, key } = options
    const [element] = Editor.nodes<Indent>(editor, {
      at: path,
      match: n => Editor.isBlock(editor, n) && (n as Indent).lineIndent !== undefined,
      mode: 'highest',
    })
    const prev = Editor.previous<List & Indent>(editor, {
      at: path,
      match: n => ListEditor.isList(editor, n, type) && n.key === key,
    })
    const prevIndentLeval = prev ? IndentEditor.getLeval(editor, prev[0]) : 0
    const prefixIndentLeval = prev ? prevIndentLeval - prev[0].level : 0
    const elementIndentLeval = element ? IndentEditor.getLeval(editor, element[0]) : 0
    return elementIndentLeval - prefixIndentLeval
  },

  findStartList: (
    editor: Editable,
    options: FindListOptions,
    callback?: (list: NodeEntry<List>) => boolean,
  ) => {
    let { path, key, level, type } = options
    let entry: NodeEntry<List> | undefined = undefined
    const match = (n: Node): n is List => ListEditor.isList(editor, n, type) && n.key === key
    while (true) {
      const prev = Editor.previous<List>(editor, {
        at: path,
        match,
      })
      if (!prev) break
      const [list, p] = prev
      if (level !== undefined && list.level < level) {
        break
      }
      path = p
      entry = prev
      if (callback && callback(entry)) break
    }
    if (!entry) {
      ;[entry] = Editor.nodes<List>(editor, {
        at: path,
        match: n => match(n) && (level === undefined || n.level === level),
      })
    }
    return entry
  },
}

interface FindListOptions {
  path: Path
  key: string
  level?: number
  type?: string
}

const isStartList = (editor: Editable, options: FindListOptions) => {
  const { path } = options
  const root = ListEditor.findStartList(editor, options)
  if (!root) return true
  return Path.equals(path, root[1])
}

type UpdateListStartOptions = FindListOptions & {
  mode?: 'all' | 'after'
  start?: number
}

const updateListStart = (editor: Editable, type: string, options: UpdateListStartOptions) => {
  const { path, key, level, mode = 'all', start } = options
  let startPath = path
  const startMap: Record<number, number> = {}
  if (start !== undefined) {
    startMap[level ?? 0] = start
  }
  if (mode === 'all') {
    const startList = ListEditor.findStartList(editor, {
      path,
      key,
      level,
      type,
    })
    if (startList) {
      const [list, path] = startList
      startPath = path
      if (start === undefined) startMap[list.level] = list.start + 1
    }
  } else {
    const startList = Node.get(editor, path)
    if (ListEditor.isList(editor, startList, type) && start === undefined)
      startMap[startList.level] = startList.start + 1
  }

  const levelOut = Number(Object.keys(startMap)[0])
  let prevLeval = levelOut
  while (true) {
    const next = Editor.next<List>(editor, {
      at: startPath,
      match: n =>
        ListEditor.isList(editor, n, type) &&
        n.key === key &&
        (level === undefined || n.level === level),
    })
    if (!next) break
    const [list, path] = next
    startPath = path
    const nextLeval = list.level
    let start = startMap[nextLeval]
    if (!start || nextLeval > prevLeval) {
      start = startMap[nextLeval] = 1
    }

    prevLeval = nextLeval
    Transforms.setNodes<List>(
      editor,
      { start },
      {
        at: startPath,
      },
    )
    startMap[nextLeval]++
  }
}

export const ListStyles = styled.div(() => [tw`w-full flex align-baseline`])
export const ListLabelStyles = styled.span(() => [tw`inline-block mr-3 whitespace-nowrap`])
export const ListContentsStyles = styled.div``

const ListElement = ({
  element,
  attributes,
  children,
  onRenderLabel,
  StyledList,
}: RenderElementProps<List> & {
  onRenderLabel: (element: List) => React.ReactNode
  StyledList?: StyledComponent<'div', any>
}) => {
  const { level } = element
  const StyledComponent = StyledList ?? ListStyles
  return (
    <StyledComponent data-list-level={level} {...attributes}>
      <ListLabelStyles>{onRenderLabel(element)}</ListLabelStyles>
      <ListContentsStyles>{children}</ListContentsStyles>
    </StyledComponent>
  )
}

export const withList = <T extends Editable>(editor: T, type: string) => {
  const newEditor = editor as T & ListEditor

  const { isList } = newEditor

  newEditor.isList = <T extends List>(value: any, t?: string): value is T => {
    if (t) return value.type === t
    return value.type === type || (typeof isList === 'function' ? isList(value, t) : false)
  }

  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const { selection } = editor
    if (
      !selection ||
      Range.isExpanded(selection) ||
      !ListEditor.queryActive(editor, type) ||
      isHotkey('shift+enter', e)
    )
      return onKeydown(e)
    if (isHotkey('enter', e)) {
      const entry = Editor.above<List>(newEditor, {
        match: n => ListEditor.isList(editor, n, type),
      })
      if (!entry) return onKeydown(e)
      e.preventDefault()
      const [list, path] = entry
      if (Editable.isEmpty(newEditor, list)) {
        if (list.level > 0) {
          const level = list.level - 1
          const [startList] = ListEditor.findStartList(
            newEditor,
            {
              path,
              key: list.key,
              level,
            },
            ([list]) => {
              return list.level === level
            },
          )
          Transforms.setNodes<List>(
            newEditor,
            {
              type: startList.type,
              level,
            },
            {
              at: path,
            },
          )
          IndentEditor.addLineIndent(newEditor, path, true)
          updateListStart(editor, type, {
            path,
            key: list.key,
          })
          if (startList.type !== type)
            updateListStart(editor, startList.type, {
              path,
              key: list.key,
            })
        } else {
          ListEditor.toggle(editor, type)
          updateListStart(editor, type, {
            path,
            key: list.key,
            level: list.level,
          })
        }

        return
      }
      // here we need to insert a new paragraph
      const heading = Editor.above(newEditor, { match: n => HeadingEditor.isHeading(editor, n) })
      if (heading) {
        Transforms.insertNodes(
          newEditor,
          { type: '', children: [] },
          { at: Path.next(path), select: true },
        )
        return
      }
      // split the current list
      Transforms.splitNodes(editor, {
        match: n => ListEditor.isList(editor, n, type),
        always: true,
      })
      updateListStart(editor, type, {
        path: selection.focus.path,
        key: list.key,
        level: list.level,
      })
      return
    } else if (isHotkey('backspace', e)) {
      const entry = Editor.above<List>(newEditor, {
        match: n => ListEditor.isList(editor, n, type),
      })
      if (entry) {
        let [list, path] = entry
        const { key } = list

        if (Editor.isStart(newEditor, selection.focus, path)) {
          if (
            Editable.isEmpty(newEditor, list) &&
            list.level > 0 &&
            IndentEditor.isIndentEditor(newEditor)
          ) {
            newEditor.toggleOutdent()
            return
          }
          const startList =
            ListEditor.findStartList(newEditor, {
              path,
              key,
              level: list.level,
              type,
            }) ?? entry
          Transforms.unwrapNodes<Indent>(newEditor, {
            at: path,
          })
          Transforms.setNodes<Indent>(
            editor,
            { lineIndent: (list as Indent).lineIndent },
            {
              at: path,
              mode: 'lowest',
              match: n => Editor.isBlock(editor, n),
            },
          )
          updateListStart(editor, type, {
            path,
            key,
            level: list.level,
            start: startList[0].start,
          })
          return
        }
      }
    }
    onKeydown(e)
  }

  if (IndentEditor.isIndentEditor(newEditor)) {
    const { onIndentMatch, toggleIndent, toggleOutdent } = newEditor
    const toggleListIndent = (mode: IndentMode = 'auto', sub = false) => {
      const { selection } = newEditor
      const entry = Editor.above<List>(newEditor, {
        at: selection?.anchor.path,
        match: n => ListEditor.isList(editor, n, type),
      })
      // 设置列表的缩进
      if (entry) {
        if (!IndentEditor.canSetIndent(newEditor, 'line')) {
          IndentEditor.insertIndent(newEditor)
          return
        }
        let [list, path] = entry
        const { key } = list
        const isStart = isStartList(editor, {
          path,
          key,
          type,
        })
        // 如果是列表的开头，则更新所有后代的缩进
        if (isStart) {
          IndentEditor.addLineIndent(newEditor, path, sub)
          let next: NodeEntry<List> | undefined = undefined
          while (true) {
            next = Editor.next(newEditor, {
              at: path,
              match: n => ListEditor.isList(editor, n, type) && n.key === key,
            })
            if (!next) break
            path = next[1]
            IndentEditor.addLineIndent(editor, path, sub)
            if (sub) {
              const level = ListEditor.calcLeval(newEditor, type, { path, key: key })
              Transforms.setNodes<List>(
                newEditor,
                { level },
                {
                  at: path,
                },
              )
            }
          }
          if (sub) {
            updateListStart(editor, type, {
              path,
              key,
            })
          }
        }
        // 非开头缩进
        else {
          // 减去缩进
          if (sub) {
            toggleOutdent()
          } else {
            toggleIndent('line')
          }
          const listEntries = Editor.nodes<List>(newEditor, {
            match: n => ListEditor.isList(newEditor, n, type),
          })
          for (const [_, p] of listEntries) {
            const level = ListEditor.calcLeval(newEditor, type, { path: p, key: key })
            Transforms.setNodes<List>(
              newEditor,
              { level },
              {
                at: p,
              },
            )
          }
          updateListStart(editor, type, {
            path,
            key,
          })
        }
      } else if (sub) {
        toggleOutdent()
      } else {
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
      if (
        ListEditor.isList(editor, node, type) ||
        Editor.above(newEditor, { match: n => ListEditor.isList(editor, n, type), at: path })
      ) {
        return ListEditor.isList(editor, node, type)
      }
      return onIndentMatch(node, path)
    }
  }

  return newEditor
}
