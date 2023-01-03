import * as React from 'react'
import tw, { css, styled } from 'twin.macro'
import { Button } from './button'
import { Dropdown } from './dropdown'
import { Tooltip } from './tooltip'
import { composeEventHandlers } from './utils'

export interface ToolbarButton extends Omit<Button, 'type'> {
  active?: boolean
  title?: React.ReactNode
  onToggle?: () => void
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButton>(
  ({ title, children, onToggle, active, ...props }, ref) => {
    const renderButton = () => (
      <Button
        css={[
          tw`shadow-none px-1 py-1`,
          css`
            font-size: inherit;
          `,
          active &&
            tw`text-primary bg-blue-100 border-blue-100 hover:bg-blue-100 hover:shadow-none hover:border-blue-100`,
        ]}
        onClick={onToggle}
        type={active ? 'primary' : 'text'}
        {...props}
        ref={ref}
      >
        {children}
      </Button>
    )
    return title ? <Tooltip content={title}>{renderButton()}</Tooltip> : renderButton()
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
  onToggle?: (value: string) => void
}

export const ToolbarDropdown = React.forwardRef<HTMLButtonElement, ToolbarDropdown>(
  ({ onToggle, defaultValue, ...props }, ref) => {
    return <Dropdown onValueChange={onToggle} {...props} ref={ref} />
  },
)

ToolbarDropdown.displayName = 'ToolbarDropdown'

export interface Toolbar extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'inline' | 'normal'
}

const StyledToolbar = styled.div<Toolbar>(({ mode }) => [
  tw`text-gray-600 relative z-10 flex items-center gap-1 cursor-default`,
  mode === 'inline' &&
    tw`bg-white shadow-outer z-50 px-2 py-1 rounded border-gray-300 border-solid border`,
])

export const Toolbar: React.FC<Toolbar> = props => {
  return (
    <StyledToolbar
      {...props}
      onClick={composeEventHandlers(props.onClick, e => e.preventDefault())}
    />
  )
}
