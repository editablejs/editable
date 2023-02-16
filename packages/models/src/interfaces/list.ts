import { Element, NodeEntry, Path, Transforms, Node, Range, Location } from 'slate'
import { Editor } from './editor'
import { generateRandomKey } from '../utils/key'

export interface List extends Element {
  start: number
  key: string
  level: number
  type: string
  template?: string
}

export interface ListAboveOptions {
  at?: Location
  match?: (node: List) => boolean
}

export interface GetLevelOptions {
  type: string
  key: string
  node: Element
  path: Path
}

export interface WrapListOptions extends ListAboveOptions {
  props?: (key: string, node: Element, path: Path) => Record<string, any>
}

export interface UnwrapListOptions extends ListAboveOptions {
  props?: (node: List, path: Path) => Record<string, any>
}

export interface SplitListOptions extends ListAboveOptions {
  props?: (node: List, path: Path) => Record<string, any>
}

export interface DeleteLevelOptions extends ListAboveOptions {
  unwrapProps?: (node: Node, path: Path) => Record<string, any>
}

interface FindFirstListOptions {
  path: Path
  key: string
  level?: number
  type?: string
}

type UpdateStartOptions = FindFirstListOptions & {
  mode?: 'all' | 'after'
  start?: number
}

export interface ListTemplate {
  key: string
  depth: number
  render: (element: Omit<List, 'children'>) => string | Record<'type' | 'text', string>
}

const TEMPLATE_WEAKMAP = new WeakMap<Editor, Map<string, ListTemplate[]>>()

export const List = {
  above: (editor: Editor, options: ListAboveOptions = {}) => {
    const { at, match } = options
    const selection = at ?? editor.selection
    if (!selection) return
    const entry = Editor.above<List>(editor, {
      at: selection,
      match: n => Editor.isList(editor, n) && (!match || match(n)),
    })
    return entry
  },

  lists: (editor: Editor, options: ListAboveOptions = {}) => {
    const { at, match } = options
    const elements = Editor.elements(editor, at)
    const entries: NodeEntry<List>[] = []
    for (const key in elements) {
      entries.push(
        ...(elements[key].filter(
          ([node]) => editor.isList(node) && (!match || match(node)),
        ) as any),
      )
    }
    return entries
  },

  /**
   * 查找符合条件的最顶部列表
   * @param editor
   * @param options
   * @returns
   */
  findFirstList: (
    editor: Editor,
    options: FindFirstListOptions & { match?: (node: List, path: Path) => boolean },
  ) => {
    const { key, level, type, match: optionMatch } = options
    let { path } = options
    let entry: NodeEntry<List> | undefined = undefined
    const match = (n: Node): n is List =>
      Editor.isList(editor, n) && (!type || n.type === type) && n.key === key
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

  isFirstList: (editor: Editor, options: FindFirstListOptions) => {
    const { path } = options
    const root = List.findFirstList(editor, options)
    if (!root) return true
    return Path.equals(path, root[1])
  },

  updateStart: (editor: Editor, options: UpdateStartOptions) => {
    const { path, key, type, level, mode = 'all', start } = options
    let startPath = path
    const startMap: Record<number, number> = {}
    if (start !== undefined) {
      startMap[level ?? 0] = start
    }
    if (mode === 'all') {
      const top = List.findFirstList(editor, {
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
        Editor.isList(editor, startList) &&
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
          Editor.isList(editor, n) &&
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
    editor: Editor,
    list: Partial<Omit<T, 'children'>> & { type: string },
    opitons: WrapListOptions = {},
  ) {
    const { at } = opitons
    let { start = 1, template, type } = list
    List.unwrapList(editor, {
      at,
    })
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      if (!selection) return
      const entrys = Editor.nodes<Element>(editor, {
        at: selection,
        match: n => Editor.isBlock(editor, n),
        mode: 'lowest',
      })

      const beforePath = Editor.before(editor, selection.anchor.path)
      const afterPath = Editor.after(editor, selection.focus.path)
      const [prev] = Editor.nodes<List>(editor, {
        at: beforePath,
        match: n => Editor.isList(editor, n) && n.type === type,
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
          match: n => Editor.isList(editor, n) && n.type === type,
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

      let prevPath = null
      for (const [node, path] of entrys) {
        if (prevPath) {
          const prevNode = Node.get(editor, prevPath)
          if (!Editor.isList(editor, prevNode)) {
            start--
          }
        }
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
        prevPath = path
        start++
      }
      if (prevPath) {
        List.updateStart(editor, {
          type,
          path: prevPath,
          key,
        })
      }
    }, at)
  },

  unwrapList: (editor: Editor, options: UnwrapListOptions = {}) => {
    const { at, match, props } = options
    const activeLists = List.lists(editor, { at, match })
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection

      let hasList = false
      const topLists = new Map<string, NodeEntry<List>>()
      for (const [element, path] of activeLists) {
        hasList = true
        const { key, type } = element
        if (!topLists.has(key)) {
          const startList = List.findFirstList(editor, {
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
      if (!hasList) return
      Transforms.unwrapNodes(editor, {
        at,
        match: n => Editor.isList(editor, n) && (!match || match(n)),
        split: true,
      })
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
    }, at)
  },

  splitList: (editor: Editor, options?: SplitListOptions) => {
    const { selection } = editor
    if (!selection || Range.isExpanded(selection)) return
    let { at, match, props } = options ?? {}
    const entry = List.above(editor, {
      at,
      match,
    })
    if (!entry) return
    const [list, path] = entry
    const type = list.type
    // 空节点拆分
    if (Editor.isEmpty(editor, list)) {
      // 缩进的节点拆分
      if (list.level > 0) {
        const level = list.level - 1
        const [top] = List.findFirstList(editor, {
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
        List.unwrapList(editor, { at, match: n => n.type === type })
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
      at,
      match: n => editor.isList(n) && n.type === type,
      always: true,
    })
    List.updateStart(editor, {
      type,
      path: selection.focus.path,
      key: list.key,
      level: list.level,
    })
  },

  deleteLevel: (editor: Editor, options?: DeleteLevelOptions) => {
    const { selection } = editor
    if (!selection) return
    const { at, match, unwrapProps } = options ?? {}
    const entry = Editor.above<List>(editor, {
      at,
      match: n => Editor.isList(editor, n) && (!match || match(n)),
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
        List.findFirstList(editor, {
          path,
          key,
          level: list.level,
          type: list.type,
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
        type: list.type,
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
  getLevel: (editor: Editor, options: GetLevelOptions) => {
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
  setIndent: (editor: Editor, list: List): List => {
    console.warn(
      '`List.setIndent` method is unimplemented. You can install `plugin-indent` plugin to make it work. Or implement it yourself.',
    )
    return list
  },

  addTemplate: (editor: Editor, type: string, template: ListTemplate) => {
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list = templates.get(type) ?? []
    list.push(template)
    templates.set(type, list)
    TEMPLATE_WEAKMAP.set(editor, templates)
  },

  getTemplate: (editor: Editor, type: string, key: string) => {
    const templates = TEMPLATE_WEAKMAP.get(editor) ?? new Map()
    const list: ListTemplate[] = templates.get(type) ?? []
    return list.find(t => t.key === key)
  },
}
