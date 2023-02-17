import { Editor, Range, Text, Point, Transforms } from '@editablejs/models'
import { MENTION_TRIGGER_KEY } from '../constants'
import { MentionEditor } from './mention-editor'
import { Mention } from '../interfaces/mention'
import { MentionOptions, setOptions } from '../options'
import { MentionComponent } from '../components/mention'
import { MentionStore } from '../store'
import { getMentionTriggerData, setMentionTriggerData } from '../weak-map'
import { MentionDecorate } from '../components/mention-decorate'
import { closeMentionDecorate } from '../utils'
import { Editable, Hotkey, Slot } from '@editablejs/editor'

const defaultTriggerChar = MENTION_TRIGGER_KEY

export const withMention = <T extends Editable>(editor: T, options: MentionOptions = {}) => {
  const newEditor = editor as T & MentionEditor

  setOptions(newEditor, options)

  const { isInline, isVoid, markableVoid } = newEditor

  editor.isInline = element => {
    return Mention.isMention(element) || isInline(element)
  }

  newEditor.isVoid = element => {
    return Mention.isMention(element) || isVoid(element)
  }

  newEditor.markableVoid = element => {
    return Mention.isMention(element) || markableVoid(element)
  }

  newEditor.insertMention = user => {
    const data = getMentionTriggerData(editor)
    if (data) {
      const at = data.rangeRef.current
      if (at)
        Transforms.delete(editor, {
          at,
        })
    }
    closeMentionDecorate(newEditor)
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      Editor.insertNode(editor, Mention.create(user))
    })
    if (editor.selection) {
      const point = Editor.after(editor, editor.selection, { unit: 'character' })
      if (point) Transforms.select(editor, point)
    }
  }

  const { renderElement } = newEditor

  newEditor.renderElement = options => {
    const { attributes, children, element } = options
    if (Mention.isMention(element)) {
      return (
        <MentionComponent editor={newEditor} attributes={attributes} element={element}>
          {children}
        </MentionComponent>
      )
    } else {
      return renderElement(options)
    }
  }

  const triggerChar = options.triggerChar ?? defaultTriggerChar

  let isInputTrigger = false
  const { onChange, onInput, onSelectStart, onBlur, onKeydown } = newEditor

  newEditor.onInput = value => {
    onInput(value)
    if (value === triggerChar) {
      isInputTrigger = true
    }
  }

  newEditor.onKeydown = event => {
    if (Hotkey.match(['space', 'esc'], event)) {
      closeMentionDecorate(newEditor)
    }
    onKeydown(event)
  }

  newEditor.onSelectStart = () => {
    onSelectStart()
    closeMentionDecorate(newEditor)
  }

  newEditor.onBlur = () => {
    onBlur()
    closeMentionDecorate(newEditor)
  }

  const getBeforeText = (editor: Editable, point: Point) => {
    const wordBefore = Editor.before(editor, point, { unit: 'word' })
    const before = wordBefore && Editor.before(editor, wordBefore)
    const beforeRange = before
      ? Editor.range(editor, before, point)
      : wordBefore && Editor.range(editor, wordBefore, point)
    const beforeText = beforeRange && Editor.string(editor, beforeRange)
    return beforeText
  }

  newEditor.onChange = () => {
    onChange()
    const { selection } = newEditor
    const triggerData = getMentionTriggerData(editor)
    // 匹配 triggerChar
    if (isInputTrigger && selection && Range.isCollapsed(selection)) {
      isInputTrigger = false
      const [start] = Range.edges(selection)
      const [text] = Editor.node(editor, start.path)
      if (options.match && !options.match(text, start.path)) {
        return
      }
      const beforeText = getBeforeText(editor, start)
      const reg = new RegExp(`(^|.*)${triggerChar}$`)
      const match = beforeText && beforeText.match(reg)

      const { path, offset } = start
      if (Text.isText(text) && match && offset > 0) {
        MentionStore.setOpen(editor, true)
        setMentionTriggerData(editor, {
          startRef: Editor.pointRef(editor, start),
          rangeRef: Editor.rangeRef(
            editor,
            Editor.range(
              editor,
              {
                path,
                offset: offset - 1,
              },
              start,
            ),
          ),
          text,
        })
      }
    }
    // get searchValue
    else if (triggerData) {
      const start = triggerData.startRef.current
      const range = triggerData.rangeRef.current
      if (!start || !range) return
      const beforeText = getBeforeText(editor, start)
      const reg = new RegExp(`(^|.*)${triggerChar}(.*)$`)
      const match = beforeText && beforeText.match(reg)
      if (match === null || start.offset === range.anchor.offset) {
        closeMentionDecorate(newEditor)
        return
      }
      const searchValue = match && match[2]
      if (typeof searchValue === 'string') {
        MentionStore.setSearchValue(editor, ~searchValue.indexOf(triggerChar) ? '' : searchValue)
      }
    }
  }

  Slot.mount(editor, MentionDecorate)
  return newEditor
}
