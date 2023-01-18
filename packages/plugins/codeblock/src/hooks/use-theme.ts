import { EditorView } from '@codemirror/view'
import { MutableRefObject } from 'react'
import { baseLight } from '../themes/base-light'
import { oneDark } from '../themes/one-dark'
import { useExtension } from './use-extension'

export function useTheme(view: MutableRefObject<EditorView | null>, theme?: 'light' | 'dark') {
  return useExtension(view, () => (theme === 'dark' ? oneDark : baseLight), [theme])
}
