import { EditableEditor, isHotkey, RenderElementProps } from "@editablejs/editor";
import { Transforms } from "slate";

export const HEADING_KEY = 'heading'
export const PARAGRAPH_KEY = 'paragraph'
export const HEADING_ONE_KEY = 'heading-one'
export const HEADING_TWO_KEY = 'heading-two'
export const HEADING_THREE_KEY = 'heading-three'
export const HEADING_FOUR_KEY = 'heading-four'
export const HEADING_FIVE_KEY = 'heading-five'
export const HEADING_SIX_KEY = 'heading-six'

export const HeadingTags = {
  [HEADING_ONE_KEY]: 'h1',
  [HEADING_TWO_KEY]: 'h2',
  [HEADING_THREE_KEY]: 'h3',
  [HEADING_FOUR_KEY]: 'h4',
  [HEADING_FIVE_KEY]: 'h5',
  [HEADING_SIX_KEY]: 'h6',
}

export type HeadingType = keyof typeof HeadingTags

type Hotkeys = Record<HeadingType, string | ((e: KeyboardEvent) => boolean)>

export const defaultHotkeys: Hotkeys = { 
  [HEADING_ONE_KEY]: 'mod+opt+1',
  [HEADING_TWO_KEY]: 'mod+opt+2',
  [HEADING_THREE_KEY]: 'mod+opt+3',
  [HEADING_FOUR_KEY]: 'mod+opt+4',
  [HEADING_FIVE_KEY]: 'mod+opt+5',
  [HEADING_SIX_KEY]: 'mod+opt+6',
}

export interface HeadingOptions {
  enabled?: HeadingType[]
  disabled?: HeadingType[]
  hotkeys?: Record<HeadingType, string | ((e: KeyboardEvent) => boolean)>
}

export const HEADING_OPTIONS = new WeakMap<EditableEditor, HeadingOptions>()

const isEnabled = (editor: EditableEditor, type: HeadingType) => { 
  const { enabled, disabled } = HEADING_OPTIONS.get(editor) ?? {}
  if(enabled && ~~enabled.indexOf(type)) return false
  if(disabled && ~disabled.indexOf(type)) return false
  return true
}

export interface HeadingInterface {

  toggleHeading: (type?: HeadingType | typeof PARAGRAPH_KEY) => void

  queryHeadingActive: () => HeadingType | null
}

const toggleHeading = (editor: EditableEditor, type?: HeadingType | typeof PARAGRAPH_KEY) => {
  if(type && type !== PARAGRAPH_KEY && !isEnabled(editor, type)) return
  const activeType = queryHeadingActive(editor)
  if(!activeType && type === PARAGRAPH_KEY) return
  Transforms.setNodes(editor, { type: activeType === type ? PARAGRAPH_KEY : type })
}

const queryHeadingActive = (editor: EditableEditor) => {
  const elements = editor.queryActiveElements()
  for(const key in HeadingTags) {
    if(elements[key]) return key as HeadingType
  }
  return null
}

const renderHeading = (editor: EditableEditor, { attributes, element, children }: RenderElementProps, next: (props: RenderElementProps) => JSX.Element) => {
  const type: HeadingType = (element.type ?? PARAGRAPH_KEY) as HeadingType
  if(type in HeadingTags) { 
    const Heading = HeadingTags[type]
    children = <Heading {...attributes}>{children}</Heading>
  }
  return next({ attributes, children, element })
}

const withHeading = <T extends EditableEditor>(editor: T, options: HeadingOptions = {}) => {
  const newEditor = editor as T & HeadingInterface

  HEADING_OPTIONS.set(newEditor, options)
  
  newEditor.toggleHeading = (type) => { 
    toggleHeading(newEditor, type)
  }

  newEditor.queryHeadingActive = () => { 
    return queryHeadingActive(editor)
  }

  const { renderElement } = newEditor

  newEditor.renderElement = (props) => {
    return renderHeading(newEditor, props, renderElement)
  }
  
  const hotkeys = Object.assign({}, defaultHotkeys, options.hotkeys)
  const { onKeydown } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => { 
    for(let key in hotkeys) {
      const type = key as HeadingType
      const hotkey = hotkeys[type]
      const toggle = () => {
        e.preventDefault()
        toggleHeading(newEditor, type)
      }
      if(typeof hotkey === 'string' && isHotkey(hotkey, e) || typeof hotkey === 'function' && hotkey(e)) {
        toggle()
        return
      }
    }
    onKeydown(e)
  }

  return newEditor
}

export default withHeading