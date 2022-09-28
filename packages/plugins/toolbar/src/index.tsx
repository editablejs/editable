import React, { createContext, FC, memo, useContext, useEffect, useRef, useState } from 'react'
import {
  Editable,
  useEditable,
  useEditableStatic,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import {
  Toolbar as UIToolbar,
  ToolbarButton as UIToolbarButton,
  ToolbarDropdown as UIToolbarDropdown,
  ToolbarSeparator,
} from '@editablejs/plugin-ui'

type EditorChangeHandler = (editor: Editable) => void
export interface ToolbarContext {
  addEventListener: (callback: EditorChangeHandler) => () => void
}

export const ToolbarContext = createContext<ToolbarContext>({} as any)
export interface ToolbarButton extends Omit<UIToolbarButton, 'active' | 'disabled' | 'onToggle'> {
  onActive?: <T extends Editable>(editor: T) => boolean
  onDisabled?: <T extends Editable>(editor: T) => boolean
  onToggle?: <T extends Editable>(editor: T) => void
  type: 'button'
}

export const ToolbarButtonDefault: FC<ToolbarButton> = ({
  type,
  onActive,
  onDisabled,
  onToggle,
  ...props
}) => {
  const { addEventListener } = useContext(ToolbarContext)

  const [active, setActive] = useState(false)
  const [disabled, setDisabled] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const onChange = (editor: Editable) => {
      const active = onActive ? onActive(editor) : false
      const disabled = onDisabled ? onDisabled(editor) : false
      setActive(active)
      setDisabled(disabled)
    }

    const unsubscribe = addEventListener(onChange)

    return () => unsubscribe()
  }, [onActive, onDisabled])

  const editor = useEditableStatic()

  const handleToogle = () => {
    if (onToggle) onToggle(editor)
  }

  return <UIToolbarButton {...props} active={active} disabled={disabled} onToggle={handleToogle} />
}

export const ToolbarButton = memo(ToolbarButtonDefault, (prev, next) => {
  return (
    prev.onActive === next.onActive &&
    prev.onDisabled === next.onDisabled &&
    prev.onToggle === next.onToggle &&
    prev.children === next.children &&
    prev.title === next.title
  )
})

export interface ToolbarDropdown
  extends Omit<UIToolbarDropdown, 'value' | 'disabled' | 'onToggle'> {
  type: 'dropdown'
  onActive?: <T extends Editable>(editor: T) => string
  onDisabled?: <T extends Editable>(editor: T) => boolean
  onToggle?: <T extends Editable>(editor: T, value: string) => void
}

export const ToolbarDropdownDefault: FC<ToolbarDropdown> = ({
  type,
  onActive,
  onDisabled,
  onToggle,
  ...props
}) => {
  const { addEventListener } = useContext(ToolbarContext)

  const [value, setValue] = useState<string>()
  const [disabled, setDisabled] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const onChange = (editor: Editable) => {
      const value = onActive ? onActive(editor) : undefined
      const disabled = onDisabled ? onDisabled(editor) : false
      setValue(value)
      setDisabled(disabled)
    }

    const unsubscribe = addEventListener(onChange)

    return () => unsubscribe()
  }, [onActive, onDisabled])

  const editor = useEditableStatic()

  const handleToogle = (value: string) => {
    if (onToggle) onToggle(editor, value)
  }

  return <UIToolbarDropdown {...props} value={value} disabled={disabled} onToggle={handleToogle} />
}

export const ToolbarDropdown = memo(ToolbarDropdownDefault, (prev, next) => {
  return (
    prev.onActive === next.onActive &&
    prev.onDisabled === next.onDisabled &&
    prev.onToggle === next.onToggle &&
    prev.children === next.children &&
    prev.items.length === next.items.length
  )
})

export type ToolbarItem = ToolbarButton | ToolbarDropdown | 'separator'

export interface ToolbarProps {
  items: ToolbarItem[]
}

const Toolbar: React.FC<ToolbarProps & React.HTMLAttributes<HTMLDivElement>> = ({
  items,
  className,
  ...props
}) => {
  const editor = useEditableStatic()

  const eventListeners = useRef<EditorChangeHandler[]>([]).current

  useEffect(() => {
    const { onSelectionChange } = editor
    const dispatch = () => {
      eventListeners.forEach(callback => callback(editor))
    }
    editor.onSelectionChange = () => {
      onSelectionChange()
      dispatch()
    }
    dispatch()
    return () => {
      editor.onSelectionChange = onSelectionChange
    }
  }, [editor, eventListeners])

  const renderItem = (item: ToolbarItem, key: any) => {
    if (item === 'separator') return <ToolbarSeparator key={key} />
    const { type } = item
    switch (type) {
      case 'button':
        return <ToolbarButton key={key} {...item} />
      case 'dropdown':
        return <ToolbarDropdown key={key} {...item} />
    }
  }
  return (
    <ToolbarContext.Provider
      value={{
        addEventListener: (callback: (editor: Editable) => void) => {
          eventListeners.push(callback)
          return () => {
            eventListeners.splice(eventListeners.indexOf(callback), 1)
          }
        },
      }}
    >
      <UIToolbar {...props}>{items.map(renderItem)}</UIToolbar>
    </ToolbarContext.Provider>
  )
}

export default Toolbar
