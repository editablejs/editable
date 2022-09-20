import { IS_APPLE } from './environment'

export const formatHotkey = (key: string) => {
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
  return keys.join('+')
}
