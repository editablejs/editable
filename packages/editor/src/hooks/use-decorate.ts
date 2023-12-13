import { Text, Path, Range, Element } from '@editablejs/models'
import { useStore } from 'rezon-store'
import { Decorate, ElementDecorate, getDecorateStore, TextDecorate } from '../plugin/decorate'
import { useEditableStatic } from './use-editable'
import { useMemo } from 'rezon'

export const useDecorateStore = () => {
  const editor = useEditableStatic()
  return useMemo(() => {
    return getDecorateStore(editor)
  }, [editor])
}

export const useTextDecorations = (text: Text, path: Path) => {
  const store = useDecorateStore()
  const decorations = useStore(store, state => state.decorations)
  return useMemo(() => {
    return decorations.reduce<{ decorate: TextDecorate; ranges: Range[] }[]>((acc, decorate) => {
      if (!Decorate.isTextDecorate(decorate)) return acc
      const ranges = decorate.match(text, path)
      if (ranges.length > 0) {
        acc.push({ decorate, ranges })
      }
      return acc
    }, [])
  }, [decorations, text, path])
}

export const useElementDecorations = (element: Element, path: Path) => {
  const store = useDecorateStore()
  const decorations = useStore(store, state => state.decorations)
  return useMemo(() => {
    return decorations.reduce<ElementDecorate[]>((acc, decorate) => {
      if (Decorate.isTextDecorate(decorate)) return acc
      if (decorate.match(element, path)) {
        acc.push(decorate)
      }
      return acc
    }, [])
  }, [decorations, element, path])
}
