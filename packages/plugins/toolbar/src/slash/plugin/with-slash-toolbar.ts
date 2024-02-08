import { Editable, Hotkey, Slot } from '@editablejs/editor'
import { Editor, Text, Range, Point } from '@editablejs/models'
import { SlashToolbarDecorate } from '../components/slash-decorate'
import { getOptions, setOptions, SlashHotkey, SlashToolbarOptions } from '../options'
import { SlashToolbar } from '../store'
import { closeSlashDecorate } from '../utils'
import { getSlashTriggerData, setSlashTriggerData } from '../weak-map'

const defaultHotkey: SlashHotkey = ['/', 'mod+/']

export interface SlashToolbarEditor extends Editable {}

export const SlashToolbarEditor = {
  getOptions,
}

export const withSlashToolbar = <T extends Editable>(
  editor: T,
  options: SlashToolbarOptions = {},
) => {
  const newEditor = editor as T & SlashToolbarEditor

  setOptions(newEditor, options)

  const hotkey = options.hotkey ?? defaultHotkey

  let isInputTrigger = false
  let isMatch = false
  let triggerChar = ''
  const { onChange, onInput, onSelectStart, onBlur, onKeydown } = newEditor

  newEditor.onInput = value => {
    onInput(value)
    if (isMatch) {
      triggerChar = value
      isInputTrigger = true
    }
  }

  newEditor.onKeydown = event => {
    isMatch = false
    if (Hotkey.match(['space', 'esc'], event)) {
      closeSlashDecorate(newEditor)
    } else {
      if (typeof hotkey === 'function') {
        isMatch = Hotkey.match(hotkey, event)
      } else {
        const hotkeys = Array.isArray(hotkey) ? hotkey : [hotkey]
        for (const hotkey of hotkeys) {
          if (Hotkey.match(hotkey, event)) {
            isMatch = true
            if (typeof hotkey === 'string' && hotkey.includes('mod+')) {
              event.preventDefault()
              const hotkeyArr = hotkey.split('+')
              const char = hotkeyArr[hotkeyArr.length - 1]
              newEditor.onInput(char)
              return
            }
            break
          }
        }
      }
    }
    onKeydown(event)
  }

  newEditor.onSelectStart = () => {
    onSelectStart()
    closeSlashDecorate(newEditor)
  }

  newEditor.onBlur = () => {
    onBlur()
    closeSlashDecorate(newEditor)
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
    const triggerData = getSlashTriggerData(editor)
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
        SlashToolbar.setOpen(editor, true)
        setSlashTriggerData(editor, {
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
        closeSlashDecorate(newEditor)
        return
      }
      const searchValue = match && match[2]
      if (typeof searchValue === 'string') {
        SlashToolbar.setSearchValue(editor, ~searchValue.indexOf(triggerChar) ? '' : searchValue)
      }
    }
  }

  Slot.mount(editor, SlashToolbarDecorate)

  return newEditor
}
