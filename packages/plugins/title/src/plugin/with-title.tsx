import { Editable, Placeholder } from '@editablejs/editor'
import { Editor, Transforms, Node, Path, List } from '@editablejs/models'
import { FC } from 'react'
import tw from 'twin.macro'
import { TITLE_KEY } from '../constants'
import { Title } from '../interfaces/title'

import { setOptions, TitleComponentProps, TitleOptions } from '../options'
import { TitleEditor } from './title-editor'

const StyledTitle = tw.h1`font-semibold text-4xl mb-6`

const DefaultTitle: FC<TitleComponentProps> = ({ attributes, children }) => {
  return <StyledTitle {...attributes}>{children}</StyledTitle>
}

const { isEmpty } = Editor

Editor.isEmpty = (editor, node) => {
  if (Editor.isEditor(node)) {
    if (!Title.isTitle(node.children[0])) return isEmpty(editor, node)
    return isEmpty(editor, { children: node.children.slice(1) })
  }
  return isEmpty(editor, node)
}

export const withTitle = <T extends Editable>(editor: T, options: TitleOptions = {}) => {
  const titleEditor = editor as T & TitleEditor

  setOptions(titleEditor, options)

  const { renderElement, normalizeNode } = titleEditor

  titleEditor.renderElement = ({ element, attributes, children }) => {
    if (Title.isTitle(element)) {
      const Component = options.component || DefaultTitle
      return <Component attributes={attributes}>{children}</Component>
    }
    return renderElement({ attributes, children, element })
  }

  titleEditor.normalizeNode = entry => {
    const [node, path] = entry
    if (Editor.isEditor(node)) {
      let isHandled = false
      const firstChild = node.children[0]
      if (!firstChild || Editor.isVoid(titleEditor, firstChild)) {
        Transforms.insertNodes(
          titleEditor,
          { type: TITLE_KEY, children: [{ text: '' }] },
          { at: [0] },
        )
        isHandled = true
      } else if (!Title.isTitle(firstChild)) {
        let block: Node = firstChild
        const path = [0]
        while (Editor.isBlock(titleEditor, block)) {
          const first: Node | undefined = block.children[0]
          if (first && Editor.isBlock(titleEditor, first)) {
            block = first
            path.push(0)
          } else {
            break
          }
        }
        Transforms.setNodes(
          titleEditor,
          {
            type: TITLE_KEY,
          },
          { at: path },
        )
        isHandled = true
      }
      const secondChild = node.children[1]
      if (!secondChild) {
        Transforms.insertNodes(
          titleEditor,
          { type: 'paragraph', children: [{ text: '' }] },
          { at: [1] },
        )
        isHandled = true
      } else if (Title.isTitle(secondChild)) {
        Transforms.setNodes(titleEditor, { type: 'paragraph' }, { at: [1] })
        isHandled = true
      }
      if (isHandled) return
    } else if (Title.isTitle(node)) {
      for (const [child, childPath] of Node.children(titleEditor, path)) {
        if (Editor.isBlock(titleEditor, child)) {
          Transforms.unwrapNodes(titleEditor, { at: childPath })
          return
        }
      }
      const parent = Node.parent(titleEditor, path)
      if (!Editor.isEditor(parent)) {
        if (Editor.isList(editor, parent)) {
          const selection = editor.selection
          const rangeRef = selection ? Editor.rangeRef(editor, selection) : null
          List.unwrapList(titleEditor, { at: path })
          const range = rangeRef?.unref()
          if (range) {
            Transforms.select(titleEditor, range)
          }
        } else {
          Transforms.unwrapNodes(titleEditor, {
            at: path,
            match: n => Editor.isBlock(titleEditor, n) && !Title.isTitle(n),
            split: true,
          })
        }
        return
      }
      if (!Path.equals(path, [0])) {
        Transforms.setNodes(titleEditor, { type: 'paragraph' }, { at: path })
        return
      }
    }
    normalizeNode(entry)
  }

  Placeholder.subscribe(
    editor,
    ([node]) => {
      if (Title.isTitle(node)) return () => options.placeholder ?? 'Untitled'
    },
    true,
  )

  return titleEditor
}
