import { render } from 'rezon'
import { ToolbarComponent, ToolbarComponentProps } from './components/toolbar'

export * from './with-toolbar'
import { getStore } from './store'
import { Editable } from '@editablejs/editor'
import { ToolbarItem } from '../types'

export const Toolbar = {
  setItems(editor: Editable, items: ToolbarItem[]) {
    const store = getStore(editor)
    store.setState({ items })
  },

  render(props: ToolbarComponentProps, cointainer: HTMLElement) {
    const root = render(ToolbarComponent(props), cointainer)

    return () => {
      root.setConnected(false)
    }
  }
}

export type { ToolbarLocale } from '../locale'
