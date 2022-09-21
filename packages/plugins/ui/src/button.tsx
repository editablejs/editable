import React, { FC, AnchorHTMLAttributes } from 'react'
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
  css`
    font-size: inherit;
  `,
])

export const Button: FC<ButtonProps & AnchorHTMLAttributes<HTMLButtonElement>> = ({
  type,
  ...props
}) => {
  return (
    <ButtonStyles
      onMouseDown={e => e.preventDefault()}
      {...props}
      type={(type as any) ?? 'button'}
    />
  )
}
