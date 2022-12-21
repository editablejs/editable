import * as React from 'react'
import tw, { styled } from 'twin.macro'
import { Button } from './button'
import { Dropdown } from './dropdown'
import { Tooltip } from './tooltip'

export interface ToolbarButton extends Omit<Button, 'type'> {
  active?: boolean
  title?: React.ReactNode
  onToggle: () => void
}

export const ToolbarButton: React.FC<ToolbarButton> = ({
  title,
  children,
  onToggle,
  active,
  ...props
}) => {
  const renderButton = () => (
    <Button
      css={[
        tw`shadow-none`,
        active &&
          tw`text-primary bg-blue-100 border-blue-100 hover:bg-blue-100 hover:shadow-none hover:border-blue-100`,
      ]}
      onClick={onToggle}
      type={active ? 'primary' : 'text'}
      {...props}
    >
      {children}
    </Button>
  )
  return title ? <Tooltip content={title}>{renderButton()}</Tooltip> : renderButton()
}

export interface ToolbarSeparator {}

export const ToolbarSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = props => (
  <div tw="mr-2 ml-2 w-px bg-gray-200" {...props}>
    &nbsp;
  </div>
)

export interface ToolbarDropdown extends Dropdown {
  onToggle: (value: string) => void
}

export const ToolbarDropdown: React.FC<ToolbarDropdown> = ({
  onToggle,
  defaultValue,
  ...props
}) => {
  return <Dropdown onValueChange={onToggle} {...props} />
}

interface Toolbar {
  Button: typeof ToolbarButton
  Dropdown: typeof ToolbarDropdown
  Separator: typeof ToolbarSeparator
}

const StyledToolbar = styled.div(() => [tw`text-gray-600 relative z-10 flex items-center gap-1`])

export const Toolbar: React.FC<React.HTMLAttributes<HTMLDivElement>> & Toolbar =
  StyledToolbar as any

Toolbar.Button = ToolbarButton
Toolbar.Dropdown = ToolbarDropdown
Toolbar.Separator = ToolbarSeparator
