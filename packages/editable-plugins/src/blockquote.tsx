import { EditableEditor, isHotkey, RenderElementProps } from "@editablejs/editor";
import { Transforms, Editor, Range, Element, Path } from "slate";
import './blockquote.less'

export const BLOCKQUOTE_KEY = 'blockquote'


type Hotkey = string | ((e: KeyboardEvent) => boolean)

const defaultHotkey: Hotkey = 'mod+shift+e'

export interface BlockquoteOptions {
  hotkey?: Hotkey
}

export interface BlockquoteInterface extends EditableEditor {

  toggleBlockquote: () => void

  queryBlockquoteActive: () => boolean
}

const toggleBlockquote = (editor: BlockquoteInterface) => {
  if(editor.queryBlockquoteActive()) {
    Transforms.unwrapNodes(editor, { 
      match: n => Editor.isBlock(editor, n) && n.type === BLOCKQUOTE_KEY,
      split: true,
    })
  } else {
    Transforms.wrapNodes(editor, { type: BLOCKQUOTE_KEY, children: [] })
  }
}

const queryBlockquoteActive = (editor: EditableEditor) => {
  const elements = editor.queryActiveElements()
  return !!elements[BLOCKQUOTE_KEY]
}

const renderBlockquote = (editor: EditableEditor, { attributes, element, children }: RenderElementProps, next: (props: RenderElementProps) => JSX.Element) => {
  if(element.type === BLOCKQUOTE_KEY) { 
    const Blockquote = BLOCKQUOTE_KEY
    return <Blockquote className="editable-blockquote" {...attributes}>{children}</Blockquote>
  }
  return next({ attributes, children, element })
}

export const withBlockquote = <T extends EditableEditor>(editor: T, options: BlockquoteOptions = {}) => {
  const newEditor = editor as T & BlockquoteInterface
  
  newEditor.toggleBlockquote = () => { 
    toggleBlockquote(newEditor)
  }

  newEditor.queryBlockquoteActive = () => { 
    return queryBlockquoteActive(editor)
  }

  const { renderElement } = newEditor

  newEditor.renderElement = (props) => {
    return renderBlockquote(newEditor, props, renderElement)
  }
  
  const hotkey = options.hotkey ?? defaultHotkey
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    const toggle = () => {
      e.preventDefault()
      toggleBlockquote(newEditor)
    }
    if(typeof hotkey === 'string' && isHotkey(hotkey, e) || typeof hotkey === 'function' && hotkey(e)) {
      toggle()
      return
    }
    const { selection } = editor
    if(selection && Range.isCollapsed(selection) && isHotkey('enter', e) && newEditor.queryBlockquoteActive()) {
      const entry = Editor.above(newEditor, { match: n => Editor.isBlock(newEditor, n) && !Editor.isVoid(newEditor, n)})
      if(entry) {
        const [block, path] = entry
        const [parent, parentPath ] = Editor.parent(newEditor, path)
        if(EditableEditor.isEmpty(newEditor, block) && (parent as Element).type === BLOCKQUOTE_KEY) {
          e.preventDefault()
          Transforms.moveNodes(newEditor, { 
            at: path,
            to: Path.next(parentPath)
          })
          return
        }
      }
    }
    onKeydown(e)
  }

  return newEditor
}