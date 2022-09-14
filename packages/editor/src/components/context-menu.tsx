import { FC, useState } from 'react'
import ReactDOM from 'react-dom'
import { useEditable } from '../hooks/use-editable'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { Editable } from './../plugin/editable'

export interface ContextMenuProps {
  root?: HTMLElement
}

const ContextMenu: FC<ContextMenuProps> = ({ root }) => {
  const editor = useEditable()

  const [children, setChildren] = useState<JSX.Element | null>(null)

  useIsomorphicLayoutEffect(() => {
    const contentlEl = Editable.toDOMNode(editor, editor)

    const handleContextMenu = (e: MouseEvent) => {
      const children = editor.onContextMenu(e, [])
      setChildren(children ?? null)
    }

    contentlEl.addEventListener('contextmenu', handleContextMenu)

    return () => {
      contentlEl.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [editor])
  return children ? ReactDOM.createPortal(children, root ?? document.body) : null
}

export default ContextMenu
