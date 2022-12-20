import * as React from 'react'
import tw, { css, styled } from 'twin.macro'

export interface Button {
  active?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

const StyledButton = styled.button(({ active, disabled }: Button) => [
  tw`flex cursor-pointer items-center rounded border-0 bg-transparent px-1 py-1 disabled:cursor-not-allowed disabled:hover:bg-transparent`,
  active && tw`text-primary bg-blue-100 hover:bg-blue-100`,
  !active && tw`hover:(bg-gray-100)`,
  !active &&
    !disabled &&
    css`
      color: inherit;
    `,
  disabled && tw`text-gray-400`,
  css`
    font-size: inherit;
  `,
])

export const Button = React.forwardRef<
  HTMLButtonElement,
  Button & React.AnchorHTMLAttributes<HTMLButtonElement>
>(({ type, ...props }, ref) => {
  return (
    <StyledButton
      onMouseDown={e => e.preventDefault()}
      {...props}
      ref={ref}
      type={(type as any) ?? 'button'}
    />
  )
})

Button.displayName = 'UIButton'
