import {
  Editor,
  Element,
  NodeEntry,
  Path,
  Transforms,
  Node,
  Range,
  NodeMatch,
  Ancestor,
} from 'slate'
import { Editable } from '../plugin/editable'
import { generateRandomKey } from '../utils/key'

export interface List extends Element {
  start: number
  key: string
  level: number
  type: string
  template?: string
}

export interface GetLevelOptions {
  type: string
  key: string
  node: Element
  path: Path
}

export interface WrapListOptions {
  props?: (key: string, node: Element, path: Path) => Record<string, any>
}

export interface UnwrapListOptions {
  type?: string
  props?: (node: List, path: Path) => Record<string, any>
}

export interface SplitListOptions {
  type?: string
  props?: (node: List, path: Path) => Record<string, any>
}

export interface DeleteLevelOptions {
  type?: string
  unwrapProps?: (node: Node, path: Path) => Record<string, any>
}

interface FindTopOptions {
  path: Path
  key: string
  level?: number
  type?: string
}

type UpdateStartOptions = FindTopOptions & {
  mode?: 'all' | 'after'
  start?: number
}

export interface ListTemplate {
  key: string
  depth: number
  render: (element: Omit<List, 'children'>) => string | Record<'type' | 'text', string>
}

const TEMPLATE_WEAKMAP = new WeakMap<Editable, Map<string, ListTemplate[]>>()

export const List = {
  find: (editor: Editable, type?: string) => {
    const { selection } = editor
    if (!selection) return
    const entry = Editor.above<List>(editor, {
      match: n => Editable.isList(editor, n) && (!type || n.type === type),
    })
    return entry
  },

  queryActive: (editor: Editable, type?: string): NodeEntry<List>[] => {
    const elements = editor.queryActiveElements()
    const entries: NodeEntry<List>[] = []
    for (const key in elements) {
      if (type) {
        return key === type ? (elements[key] as any) : []
      } else {
        entries.push(...(elements[key].filter(([node]) => Editable.isList(editor, node)) as any))
      }
    }
    return entries
  },

  /**
   * 查找符合条件的最顶部列表
   * @param editor
   * @param options
   * @returns
   */
  findTop: (
    editor: Editable,
    options: FindTopOptions & { match?: (node: List, path: Path) => boolean },
  ) => {
    const { key, level, type, match: optionMatch } = options
    let { path } = options
    let entry: NodeEntry<List> | undefined = undefined
    const match = (n: Node): n is List =>
      Editable.isList(editor, n) && (!type || n.type === type) && n.key === key
    while (true) {
      const prev = Editor.previous<List>(editor, {
        at: path,
        match,
      })
      if (!prev) break
      const [prevList, p] = prev
      if (level !== undefined && prevList.level < level) {
        break
      }
      path = p
      entry = prev
      if (optionMatch && optionMatch(entry[0], entry[1])) break
    }
    if (!entry) {
      ;[entry] = Editor.nodes<List>(editor, {
        at: path,
        match: n => match(n) && (level === undefined || n.level === level),
      })
    }
    return entry
  },

  isTop: (editor: Editable, options: FindTopOptions) => {
    const { path } = options
    const root = List.findTop(editor, options)
    if (!root) return true
    return Path.equals(path, root[1])
  },

  updateStart: (editor: Editable, options: UpdateStartOptions) => {
    const { path, key, type, level, mode = 'all', start } = options
    let startPath = path
    const startMap: Record<number, number> = {}
    if (start !== undefined) {
      startMap[level ?? 0] = start
    }
    if (mode === 'all') {
      const top = List.findTop(editor, {
        path,
        key,
        level,
        type,
      })
      if (top) {
        const [list, path] = top
        startPath = path
        if (start === undefined) startMap[list.level] = list.start
      }
    } else {
      const startList = Node.get(editor, path)
      if (
        Editable.isList(editor, startList) &&
        (!type || startList.type === type) &&
        start === undefined
      )
        startMap[startList.level] = startList.start
    }

    const levelOut = Number(Object.keys(startMap)[0])
    let prevLevel = levelOut
    while (true) {
      const next = Editor.next<List>(editor, {
        at: startPath,
        match: n =>
          Editable.isList(editor, n) &&
          (!type || n.type === type) &&
          n.key === key &&
          (level === undefined || n.level === level),
      })
      if (!next) break
      const [list, path] = next
      startPath = path
      const nextLevel = list.level
      let start = startMap[nextLevel]
      if (!start || nextLevel > prevLevel) {
        start = startMap[nextLevel] = 1
      } else {
        start++
        startMap[nextLevel]++
      }

      prevLevel = nextLevel
      Transforms.setNodes<List>(
        editor,
        { start },
        {
          at: startPath,
        },
      )
    }
  },

  wrapList<T extends List>(
    editor: Editable,
    list: Partial<Omit<T, 'children'>> & { type: string },
    opitons: WrapListOptions = {},
  ) {
    let { start = 1, template, type } = list
    List.unwrapList(editor)
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      if (!selection) return
      const entrys = Editor.nodes<Element>(editor, {
        match: n => Editor.isBlock(editor, n),
        mode: 'lowest',
      })

      const beforePath = Editor.before(editor, selection.anchor.path)
      const afterPath = Editor.after(editor, selection.focus.path)
      const [prev] = Editor.nodes<List>(editor, {
        at: beforePath,
        match: n => Editable.isList(editor, n) && n.type === type,
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
          match: n => Editable.isList(editor, n) && n.type === type,
        })) &&
        next
      ) {
        const nextList = next[0]
        key = nextList.key
        start = Math.max(nextList.start - 1, 1)
      } else {
        key = generateRandomKey()
      }
      const { props } = opitons
      let nextPath: Path = []
      for (const [node, path] of entrys) {
        const newLevel = List.getLevel(editor, {
          type,
          path,
          key,
          node,
        })
        const newProps = props ? props(key, node, path) : {}
        const element: List = {
          type,
          key,
          start,
          template,
          level: newLevel,
          ...newProps,
          children: [],
        }
        Transforms.wrapNodes(editor, element, {
          at: path,
        })
        nextPath = path
        start++
      }
      if (nextPath.length > 0) {
        List.updateStart(editor, {
          type,
          path: nextPath,
          key,
        })
      }
    })
  },

  unwrapList: (editor: Editable, options: UnwrapListOptions = {}) => {
    const { type, props } = options
    const activeLists = List.queryActive(editor, type)
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      if (activeLists.length > 0) {
        const topLists = new Map<string, NodeEntry<List>>()
        for (const [element, path] of activeLists) {
          const { key } = element
          if (!topLists.has(key)) {
            const startList = List.findTop(editor, {
              path,
              key,
              level: element.level,
              type,
            }) ?? [element, path]
            topLists.set(key, startList)
          }

          const p = props ? props(element, path) : undefined
          if (p) {
            element.children.forEach((child, index) => {
              if (Editor.isBlock(editor, child)) {
                Transforms.setNodes(
                  editor,
                  { ...p },
                  {
                    at: path.concat(index),
                  },
                )
              }
            })
          }
        }
        Transforms.unwrapNodes(editor, {
          match: n => Editable.isList(editor, n) && (!type || n.type === type),
          split: true,
        })
        const { selection } = editor
        if (!selection) return
        for (const [key, [list, path]] of topLists) {
          List.updateStart(editor, {
            type: list.type,
            path,
            key: key,
            level: list.level,
            start: list.start,
          })
        }
      }
    })
  },

  splitList: (editor: Editable, options?: SplitListOptions) => {
    const { selection } = editor
    if (!selection || Range.isExpanded(selection)) return
    let { type, props } = options ?? {}
    const entry = List.find(editor, type)
    if (!entry) return
    const [list, path] = entry
    type = list.type
    // 空节点拆分
    if (Editable.isEmpty(editor, list)) {
      // 缩进的节点拆分
      if (list.level > 0) {
        const level = list.level - 1
        const [top] = List.findTop(editor, {
          path,
          key: list.key,
          level,
          match: list => list.level === level,
        })

        Transforms.setNodes<List>(
          editor,
          {
            type: top.type,
            level,
            ...(props ? props(list, path) : {}),
          },
          {
            at: path,
          },
        )
        List.updateStart(editor, {
          type,
          path,
          key: list.key,
        })
        if (top.type !== type)
          List.updateStart(editor, {
            type: top.type,
            path,
            key: list.key,
          })
      } else {
        List.unwrapList(editor, { type })
        List.updateStart(editor, {
          type,
          path,
          key: list.key,
          level: list.level,
        })
      }

      return
    }
    // split the current list
    Transforms.splitNodes(editor, {
      match: n => editor.isList(n) && (!type || n.type === type),
      always: true,
    })
    List.updateStart(editor, {
      type,
      path: selection.focus.path,
      key: list.key,
      level: list.level,
    })
  },

  deleteLevel: (editor: Editable, options?: DeleteLevelOptions) => {
    const { selection } = editor
    if (!selection) return
    const { type, unwrapProps } = options ?? {}
    const entry = Editor.above<List>(editor, {
      match: n => Editable.isList(editor, n) && (!type || n.type === type),
    })
    if (!entry) return
    let [list, path] = entry
    const { key } = list
    // 在节点开始位置
    if (Editor.isStart(editor, selection.focus, path)) {
      // 大于0 就减少1
      if (list.level > 0) {
        Transforms.setNodes<List>(
          editor,
          {
            level: list.level - 1,
          },
          {
            at: path,
          },
        )
        return
      }
      const top =
        List.findTop(editor, {
          path,
          key,
          level: list.level,
          type,
        }) ?? entry
      // level 为0 就删除
      Transforms.unwrapNodes(editor, {
        at: path,
      })
      if (unwrapProps) {
        Transforms.setNodes(
          editor,
          { ...unwrapProps(list, path) },
          {
            at: path,
            mode: 'lowest',
            match: n => Editor.isBlock(editor, n),
          },
        )
      }

      List.updateStart(editor, {
        type,
        path,
        key,
        level: list.level,
        start: top[0].start,
      })
    }
  },

  /**
   * 根据列表缩进的获取 level
   * @param editor
   * @param options
   * @returns
   */
  getLevel: (editor: Editable, options: GetLevelOptions) => {
    console.warn(
      '`List.getLevel` method is unimplemented and always returns 0. You can install `plugin-indent` plugin to make it work. Or implement it yourself.',
    )
    return 0
  },

  /**
   * 根据 level 设置列表的缩进
   * @param editor
   * @param list
   */
  setIndent: (editor: Editable, list: List): List => {
    console.warn(
      '`List.setIndent` method is unimplemented. You can install `plugin-indent` plugin to make it work. Or implement it yourself.',
    )
    return list
  },

  addTemplate: (editor: Editable, type: string, template: ListTemplate) => {
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list = templates.get(type) ?? []
    list.push(template)
    templates.set(type, list)
    TEMPLATE_WEAKMAP.set(editor, templates)
  },

  getTemplate: (editor: Editable, type: string, key: string) => {
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list: ListTemplate[] = templates.get(type) ?? []
    return list.find(t => t.key === key)
  },
}
