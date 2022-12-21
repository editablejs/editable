import * as React from 'react'
import tw, { styled } from 'twin.macro'

type ButtonType = 'default' | 'primary' | 'text'
export interface Button {
  disabled?: boolean
  children?: React.ReactNode
  htmlType?: 'button' | 'submit' | 'reset'
  type?: 'primary' | 'default' | 'text'
  icon?: React.ReactNode
  shape?: 'circle' | 'round'
  size?: 'small' | 'medium' | 'large'
}

const StyledButton = styled.button(
  ({
    _type,
    disabled,
    shape,
    size = 'medium',
  }: Omit<Button, 'type'> & Record<'_type', ButtonType>) => [
    _type === 'default' &&
      tw`border border-primary text-primary font-medium rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out`,
    _type === 'primary' &&
      tw`border border-primary bg-primary text-white font-medium rounded shadow hover:bg-blue-700 hover:border-blue-700 hover:shadow-md focus:bg-blue-700 focus:shadow-md focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-md transition duration-150 ease-in-out`,
    _type === 'text' &&
      tw`border border-transparent bg-transparent font-medium rounded hover:text-primary hover:bg-gray-100 hover:border-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200 transition duration-150 ease-in-out`,
    disabled && tw`opacity-60 cursor-not-allowed hover:text-white`,
    shape === 'circle' && tw`rounded-full`,
    size === 'large' && tw`px-7 py-1.5 text-lg`,
    size === 'small' && tw`px-4 py-0.5 text-xs`,
    size === 'medium' && tw`px-6 py-1 text-base`,
  ],
)

export const Button = React.forwardRef<
  HTMLButtonElement,
  Button & React.AnchorHTMLAttributes<HTMLButtonElement>
>(({ type, htmlType, icon, children, ...props }, ref) => {
  const onlyIcon = icon && !children
  return (
    <StyledButton
      onMouseDown={e => e.preventDefault()}
      {...props}
      ref={ref}
      _type={type ?? 'default'}
      type={(htmlType as any) ?? 'button'}
      css={[
        onlyIcon && props.shape !== 'round' && !props.size && tw`px-1`,
        onlyIcon && props.shape !== 'round' && props.size === 'small' && tw`px-0.5`,
        onlyIcon && props.shape !== 'round' && props.size === 'large' && tw`px-1.5`,
        !!icon && !!children && tw`inline-flex justify-center gap-1 items-center`,
      ]}
    >
      {icon}
      {children}
    </StyledButton>
  )
})

Button.displayName = 'UIButton'
