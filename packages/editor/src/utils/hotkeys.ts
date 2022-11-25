import isHotkey, { isCodeHotkey, isKeyHotkey } from 'is-hotkey'
import { IS_APPLE } from './environment'

/**
 * Hotkey mappings for each platform.
 */

const HOTKEYS: Record<string, string | string[]> = {
  compose: ['down', 'left', 'right', 'up', 'backspace', 'enter'],
  cut: 'mod+x',
  copy: 'mod+c',
  paste: 'mod+v',
  pasteText: 'mod+shift+v',
  moveUp: 'up',
  moveDown: 'down',
  moveBackward: 'left',
  moveForward: 'right',
  shift: 'shift',
  moveWordBackward: 'ctrl+left',
  moveWordForward: 'ctrl+right',
  extendUp: 'shift+up',
  extendDown: 'shift+down',
  deleteBackward: 'shift?+backspace',
  deleteForward: 'shift?+delete',
  extendBackward: 'shift+left',
  extendForward: 'shift+right',
  insertSoftBreak: 'shift+enter',
  splitBlock: 'enter',
  undo: 'mod+z',
}

const APPLE_HOTKEYS: Record<string, string | string[]> = {
  moveLineBackward: 'opt+up',
  moveLineForward: 'opt+down',
  moveWordBackward: 'opt+left',
  moveWordForward: 'opt+right',
  deleteBackward: ['ctrl+backspace', 'ctrl+h'],
  deleteForward: ['ctrl+delete', 'ctrl+d'],
  deleteLineBackward: 'cmd+shift?+backspace',
  deleteLineForward: ['cmd+shift?+delete', 'ctrl+k'],
  deleteWordBackward: 'opt+shift?+backspace',
  deleteWordForward: 'opt+shift?+delete',
  extendLineBackward: 'opt+shift+up',
  extendLineForward: 'opt+shift+down',
  redo: 'cmd+shift+z',
  transposeCharacter: 'ctrl+t',
}

const WINDOWS_HOTKEYS: Record<string, string | string[]> = {
  deleteWordBackward: 'ctrl+shift?+backspace',
  deleteWordForward: 'ctrl+shift?+delete',
  redo: ['ctrl+y', 'ctrl+shift+z'],
}

/**
 * Create a platform-aware hotkey checker.
 */

const create = (key: string) => {
  const generic = HOTKEYS[key]
  const apple = APPLE_HOTKEYS[key]
  const windows = WINDOWS_HOTKEYS[key]
  const isGeneric = generic && isKeyHotkey(generic)
  const isApple = apple && isKeyHotkey(apple)
  const isWindows = windows && isKeyHotkey(windows)

  return (event: KeyboardEvent) => {
    if (isGeneric && isGeneric(event)) return true
    if (IS_APPLE && isApple && isApple(event)) return true
    if (!IS_APPLE && isWindows && isWindows(event)) return true
    return false
  }
}

/**
 * Hotkeys.
 */

const Hotkeys = {
  isCut: create('cut'),
  isCopy: create('copy'),
  isPaste: create('paste'),
  isPasteText: create('pasteText'),
  isMoveUp: create('moveUp'),
  isMoveDown: create('moveDown'),
  isCompose: create('compose'),
  isMoveBackward: create('moveBackward'),
  isMoveForward: create('moveForward'),
  isDeleteBackward: create('deleteBackward'),
  isDeleteForward: create('deleteForward'),
  isDeleteLineBackward: create('deleteLineBackward'),
  isDeleteLineForward: create('deleteLineForward'),
  isDeleteWordBackward: create('deleteWordBackward'),
  isDeleteWordForward: create('deleteWordForward'),
  isExtendUp: create('extendUp'),
  isExtendDown: create('extendDown'),
  isExtendBackward: create('extendBackward'),
  isExtendForward: create('extendForward'),
  isExtendLineBackward: create('extendLineBackward'),
  isExtendLineForward: create('extendLineForward'),
  isMoveLineBackward: create('moveLineBackward'),
  isMoveLineForward: create('moveLineForward'),
  isMoveWordBackward: create('moveWordBackward'),
  isMoveWordForward: create('moveWordForward'),
  isShift: create('shift'),
  isRedo: create('redo'),
  isSoftBreak: create('insertSoftBreak'),
  isSplitBlock: create('splitBlock'),
  isTransposeCharacter: create('transposeCharacter'),
  isUndo: create('undo'),
}

export default Hotkeys

export const Hotkey = {
  is: isHotkey,
  isCode: isCodeHotkey,
  isKey: isKeyHotkey,

  format: (key: string, char = '+') => {
    let keys = key.toLowerCase().split('+')
    keys = keys.map(key => {
      if (key === 'mod') {
        return IS_APPLE ? '⌘' : 'Ctrl'
      } else if (key === 'opt') {
        return IS_APPLE ? 'Option' : 'Alt'
      } else if (key.length > 1) {
        return key.substring(0, 1).toUpperCase() + key.substring(1).toLowerCase()
      }
      return key.toUpperCase()
    })
    return keys.join(char)
  },
}
