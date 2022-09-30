import React, { FC, AnchorHTMLAttributes, forwardRef } from 'react'
import tw, { css, styled } from 'twin.macro'

export interface ButtonProps {
  active?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

const ButtonStyles = styled.button(({ active, disabled }: ButtonProps) => [
  tw`flex cursor-pointer items-center rounded-sm border-0 bg-transparent px-1 py-1 disabled:cursor-not-allowed disabled:hover:bg-transparent`,
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

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & AnchorHTMLAttributes<HTMLButtonElement>
>(({ type, ...props }, ref) => {
  return (
    <ButtonStyles
      onMouseDown={e => e.preventDefault()}
      {...props}
      ref={ref}
      type={(type as any) ?? 'button'}
    />
  )
})

Button.displayName = 'UIButton'
