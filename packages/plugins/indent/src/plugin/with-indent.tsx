import {
  Editable,
  ElementAttributes,
  Hotkey,
  RenderElementAttributes,
  RenderElementProps,
} from '@editablejs/editor'
import { Path, Editor, List, Transforms, NodeEntry, Range, Element, Node } from '@editablejs/models'
import tw from 'twin.macro'
import { INDENT_KEY, OUTDENT_KEY } from '../constants'
import { Indent, IndentType } from '../interfaces/indent'
import { getOptions, IndentHotkey, IndentOptions, setOptions } from '../options'
import { IndentMode } from '../types'
import { setLineIndent, setTextIndent } from '../utils'
import { IndentEditor } from './indent-editor'

const defaultHotkeys: IndentHotkey = {
  [INDENT_KEY]: 'tab',
  [OUTDENT_KEY]: 'shift+tab',
}

const getIndentSize = (editor: Editor, type: IndentType, size: number) => {
  const { onRenderSize } = getOptions(editor)
  return onRenderSize ? onRenderSize(type, size) : size
}

export const renderIndentAttributes = (
  editor: Editable,
  { attributes, element }: RenderElementAttributes<Indent>,
  next: (props: RenderElementAttributes) => ElementAttributes,
) => {
  const { textIndent, lineIndent, type } = element
  const style: React.CSSProperties = attributes.style ?? {}
  if (textIndent && type !== INDENT_KEY) {
    style.textIndent = getIndentSize(editor, 'text', textIndent)
  } else {
    delete style.textIndent
  }
  if (lineIndent) {
    style.paddingLeft = getIndentSize(editor, 'line', lineIndent)
  } else {
    delete style.paddingLeft
  }
  return next({ attributes: Object.assign({}, attributes, { style }), element })
}

const toggleListIndent = (
  editor: Editor,
  entry: NodeEntry<List>,
  size: number,
  mode: IndentMode = 'auto',
) => {
  if (!IndentEditor.isIndentEditor(editor)) return
  if (!IndentEditor.canSetIndent(editor, 'line')) {
    IndentEditor.insertIndent(editor)
    return
  }
  const isSub = size < 0
  let [list, path] = entry
  const { key, type } = list
  const isTop = List.isFirstList(editor, {
    path,
    key,
    type,
  })
  // 如果是列表的开头，则更新所有后代的缩进
  if (isTop) {
    IndentEditor.addLineIndent(editor, path, isSub)
    let next: NodeEntry<List> | undefined = undefined
    while (true) {
      next = Editor.next(editor, {
        at: path,
        match: n => editor.isList(n) && n.type === type && n.key === key,
      })
      if (!next) break
      path = next[1]
      IndentEditor.addLineIndent(editor, path, isSub)
      if (isSub) {
        const level = List.getLevel(editor, { path, key: key, type, node: next[0] })
        Transforms.setNodes<List>(
          editor,
          { level },
          {
            at: path,
          },
        )
      }
    }
    if (isSub) {
      List.updateStart(editor, {
        path,
        key,
        type,
      })
    }
  }
  // 非开头缩进
  else {
    // 减去缩进
    if (isSub) {
      toggleNormalIndent(editor, size, mode)
    } else {
      toggleNormalIndent(editor, size, 'line')
    }
    const listEntries = Editor.nodes<List>(editor, {
      match: n => editor.isList(n) && n.type === type,
    })
    for (const [node, p] of listEntries) {
      const level = List.getLevel(editor, {
        path: p,
        key: key,
        node,
        type,
      })
      Transforms.setNodes<List>(
        editor,
        { level },
        {
          at: p,
        },
      )
    }
    List.updateStart(editor, {
      path,
      key,
      type,
    })
  }
}

const toggleNormalIndent = (editor: Editor, size: number, mode: IndentMode = 'auto') => {
  const { selection } = editor
  if (!selection || !IndentEditor.isIndentEditor(editor)) return
  // 是否选中一行
  const selectLine = Editable.getSelectLine(editor)
  // 是否选中在一行的开始或结尾位置
  const selectLineEdge = Editable.isSelectLineEdge(editor)

  const isCollapsed = Range.isCollapsed(selection)
  // text indent
  if (isCollapsed && (!selectLine || mode === 'line')) {
    const entry = Editor.above(editor, {
      match: editor.onIndentMatch,
      at: selection.anchor,
    })
    if (!entry) return
    const [_, path] = entry
    // 在节点的开始位置，设置text indent
    if (Editor.isStart(editor, selection.focus, path)) {
      mode === 'line' ? setLineIndent(editor, entry, size) : setTextIndent(editor, entry, size)
      return
    }
    // 在一行的开始位置，设置line indent
    else if (selectLineEdge) {
      if (size > 0) {
        setTextIndent(editor, entry, -size)
      }
      setLineIndent(editor, entry, size)
    }
  }
  // line indent
  else if (selectLine) {
    const blockEntrys = Editor.nodes<Indent>(editor, {
      match: editor.onIndentMatch,
      mode: 'lowest',
    })
    if (!blockEntrys) return
    for (const entry of blockEntrys) {
      setLineIndent(editor, entry, size)
    }
    return
  }

  IndentEditor.insertIndent(editor)
}

const toggleIndent = (editor: IndentEditor, size: number, mode: IndentMode = 'auto') => {
  editor.normalizeSelection(selection => {
    if (!selection) return
    if (editor.selection !== selection) editor.selection = selection
    if (!IndentEditor.isIndentEditor(editor)) return
    const entry = Editor.above<List>(editor, {
      at: selection.anchor.path,
      match: n => editor.isList(n),
    })
    // 设置列表的缩进
    if (entry) {
      toggleListIndent(editor, entry, size, mode)
    } else {
      toggleNormalIndent(editor, size, mode)
    }
  })
}

const StyledIndent = tw.span`h-full inline-flex`

const renderIndent = (
  editor: Editable,
  { attributes, element, children }: RenderElementProps<Indent>,
  next: (props: RenderElementProps) => JSX.Element,
) => {
  const style: React.CSSProperties = attributes.style ?? {}

  const { textIndent, type } = element

  if (textIndent && type === INDENT_KEY) {
    children = (
      <StyledIndent style={{ width: getIndentSize(editor, 'text', textIndent) }}>
        {children}
      </StyledIndent>
    )
  }
  return next({ attributes: Object.assign({}, attributes, { style }), children, element })
}

export const withIndent = <T extends Editable>(editor: T, options: IndentOptions = {}) => {
  const newEditor = editor as T & IndentEditor

  setOptions(newEditor, options)

  const size = IndentEditor.getSize(editor)

  newEditor.toggleIndent = mode => {
    toggleIndent(newEditor, size, mode)
  }

  newEditor.toggleOutdent = () => {
    toggleIndent(newEditor, -size)
  }

  newEditor.onIndentMatch = (n: Node, path: Path) => {
    if (editor.isList(n)) {
      return true
    } else if (Editor.above(newEditor, { match: n => editor.isList(n), at: path })) {
      return false
    }
    return Editor.isBlock(editor, n)
  }

  const { renderElement, renderElementAttributes } = newEditor

  newEditor.renderElementAttributes = props => {
    return renderIndentAttributes(newEditor, props, renderElementAttributes)
  }

  newEditor.renderElement = props => {
    return renderIndent(newEditor, props, renderElement)
  }

  const { onKeydown, isInline, isVoid, isSolidVoid } = newEditor

  newEditor.isInline = (el: Element) => {
    return IndentEditor.isIndent(newEditor, el) || isInline(el)
  }

  newEditor.isVoid = (el: Element) => {
    return IndentEditor.isIndent(newEditor, el) || isVoid(el)
  }

  newEditor.isSolidVoid = (el: Element) => {
    if (IndentEditor.isIndent(newEditor, el)) return false
    return isSolidVoid(el)
  }

  const hotkeys: IndentHotkey = Object.assign({}, defaultHotkeys, options.hotkey)
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const value = Hotkey.match(hotkeys, e)
    if (value) {
      e.preventDefault()
      if (value === 'outdent') newEditor.toggleOutdent()
      else newEditor.toggleIndent()
      return
    }
    const { selection } = editor
    if (selection && Range.isCollapsed(selection) && Hotkey.match('backspace', e)) {
      const entry = Editor.above(newEditor, {
        match: newEditor.onIndentMatch,
      })
      const active = IndentEditor.queryActive(newEditor)
      if (
        active &&
        active.level > 0 &&
        entry &&
        Editor.isStart(editor, selection.focus, entry[1])
      ) {
        newEditor.toggleOutdent()
        return
      }
    }
    onKeydown(e)
  }

  return newEditor
}
