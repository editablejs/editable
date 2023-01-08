import {
  Editable,
  Editor,
  Range,
  Decorate,
  Text,
  Path,
  Point,
  PointRef,
  Slot,
  Hotkey,
} from '@editablejs/editor'
import tw from 'twin.macro'
import { MENTION_KEY, MENTION_TRIGGER_KEY } from '../constants'
import { MentionEditor } from './editor'
import { Mention } from '../interfaces/mention'
import { MentionOptions, setOptions } from '../options'
import { MentionComponent } from '../components/mention'
import { getMentionStore, MentionStore } from '../store'
import { clearMentionTriggerData, getMentionTriggerData, setMentionTriggerData } from '../weak-map'
import { MentionDecorate } from '../components/mention-decorate'

const defaultTriggerChar = MENTION_TRIGGER_KEY

export const withMention = <T extends Editable>(editor: T, options: MentionOptions = {}) => {
  const newEditor = editor as T & MentionEditor

  setOptions(newEditor, options)

  const { placeholder = '123' } = options

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
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      Editor.insertNode(editor, Mention.create(user))
    })
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

  const closeMentionDecorate = () => {
    MentionStore.setOpen(editor, false)
    const triggerData = getMentionTriggerData(editor)
    if (triggerData) {
      triggerData.rangeRef.unref()
      triggerData.startRef.unref()
    }
    clearMentionTriggerData(editor)
  }

  newEditor.onKeydown = event => {
    if (Hotkey.is('space', event)) {
      closeMentionDecorate()
    }
    onKeydown(event)
  }

  newEditor.onSelectStart = () => {
    onSelectStart()
    closeMentionDecorate()
  }

  newEditor.onBlur = () => {
    onBlur()
    closeMentionDecorate()
  }

  const getBeforeText = (editor: Editable, point: Point) => {
    const wordBefore = Editor.before(editor, point, { unit: 'word' })
    const before = wordBefore && Editor.before(editor, wordBefore)
    const beforeRange = before && Editor.range(editor, before, point)
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
    // 获取 searchValue
    else if (triggerData) {
      const start = triggerData.startRef.current
      if (!start) return
      const beforeText = getBeforeText(editor, start)
      const reg = new RegExp(`(^|.*)${triggerChar}(.*)$`)
      const match = beforeText && beforeText.match(reg)
      const searchValue = match && match[2]
      if (typeof searchValue === 'string') {
        MentionStore.setSearchValue(editor, searchValue)
      }
    }
  }

  Slot.mount(editor, MentionDecorate)
  return newEditor
}
