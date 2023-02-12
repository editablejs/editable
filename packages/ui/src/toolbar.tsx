import * as React from 'react'
import tw, { css, styled } from 'twin.macro'
import { Button } from './button'
import { ColorPicker, ColorPickerProps } from './color-picker'
import { Dropdown } from './dropdown'
import { Select } from './select'
import { Tooltip, TooltipProps } from './tooltip'
import { composeEventHandlers } from './utils'

export interface ToolbarButton extends Omit<Button, 'type'> {
  active?: boolean
  title?: React.ReactNode
  onToggle?: () => void
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButton>(
  ({ title, children, onToggle, active, ...props }, ref) => {
    const { side } = useToolbarContext()
    const renderButton = () => (
      <Button
        css={[
          tw`shadow-none w-7 h-7`,
          css`
            &[data-active='true'] {
              ${tw`text-primary bg-blue-100 border-blue-100 hover:bg-blue-100 hover:text-primary hover:border-blue-100`}
            }
          `,
          children && tw`w-auto`,
        ]}
        data-active={active || undefined}
        onClick={onToggle}
        type={active ? 'primary' : 'text'}
        {...props}
        ref={ref}
      >
        {children}
      </Button>
    )
    return title ? (
      <Tooltip content={title} side={side}>
        {renderButton()}
      </Tooltip>
    ) : (
      renderButton()
    )
  },
)

ToolbarButton.displayName = 'ToolbarButton'

export interface ToolbarSeparator {}

export const ToolbarSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div tw="mr-2 ml-2 w-px bg-gray-200" {...props} ref={ref}>
    &nbsp;
  </div>
))

ToolbarSeparator.displayName = 'ToolbarSeparator'

export interface ToolbarDropdown extends Dropdown {
  title?: React.ReactNode
}

export const ToolbarDropdown = React.forwardRef<HTMLButtonElement, ToolbarDropdown>(
  ({ title, ...props }, ref) => {
    const { side } = useToolbarContext()

    const renderDropdown = () => <Dropdown tw="h-7" {...props} ref={ref} />

    return title ? (
      <Tooltip content={title} side={side}>
        {renderDropdown()}
      </Tooltip>
    ) : (
      renderDropdown()
    )
  },
)

ToolbarDropdown.displayName = 'ToolbarDropdown'

export interface ToolbarSelect extends Select {
  title?: React.ReactNode
}

export const ToolbarSelect = React.forwardRef<HTMLInputElement, ToolbarSelect>(
  ({ title, ...props }, ref) => {
    const { side } = useToolbarContext()

    const renderSelect = () => (
      <Select tw="h-7 border-none hover:bg-gray-100" {...props} ref={ref} />
    )

    return title ? (
      <Tooltip content={title} side={side}>
        {renderSelect()}
      </Tooltip>
    ) : (
      renderSelect()
    )
  },
)

ToolbarSelect.displayName = 'ToolbarSelect'

export interface ToolbarColorPicker extends Omit<ColorPickerProps, 'renderButton' | 'side'> {
  title?: React.ReactNode
}

export const ToolbarColorPicker = React.forwardRef<HTMLDivElement, ToolbarColorPicker>(
  ({ title, ...props }, ref) => {
    const { side } = useToolbarContext()
    return (
      <ColorPicker
        renderButton={({ children }) => {
          return title ? (
            <Tooltip content={title} side={side}>
              {children}
            </Tooltip>
          ) : (
            children
          )
        }}
        tw="h-7"
        side={side}
        {...props}
        ref={ref}
      />
    )
  },
)

ToolbarColorPicker.displayName = 'ToolbarColorPicker'

export interface Toolbar extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'inline' | 'normal'
  side?: TooltipProps['side']
}

const StyledToolbar = styled.div<Toolbar>(({ mode }) => [
  tw`text-gray-600 z-10 flex items-center gap-1 cursor-default`,
  mode === 'inline' &&
    tw`bg-white shadow-md z-50 px-2 py-1 rounded border-zinc-200 border-solid border`,
])

export interface ToolbarContext {
  side: TooltipProps['side']
  mode: Toolbar['mode']
}

export const ToolbarContext = React.createContext<ToolbarContext>(null as any)

export const useToolbarContext = () => React.useContext(ToolbarContext)

export const Toolbar: React.FC<Toolbar> = props => {
  const { mode = 'normal' } = props
  const side = props.side ?? mode === 'inline' ? 'top' : 'bottom'
  return (
    <ToolbarContext.Provider value={{ side, mode }}>
      <StyledToolbar
        {...props}
        onClick={composeEventHandlers(props.onClick, e => e.preventDefault())}
      />
    </ToolbarContext.Provider>
  )
}
