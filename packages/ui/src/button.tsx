import * as React from 'react'
import tw, { css, styled } from 'twin.macro'

type ButtonType = 'default' | 'primary' | 'text'
export interface Button {
  disabled?: boolean
  children?: React.ReactNode
  htmlType?: 'button' | 'submit' | 'reset'
  type?: 'primary' | 'default' | 'text'
  icon?: React.ReactNode
  shape?: 'circle' | 'round'
  size?: 'small' | 'default' | 'large'
}

const StyledButton = styled.button(
  ({
    _type,
    disabled,
    shape,
    size = 'default',
    onlyIcon,
    iconAndText,
  }: Omit<Button, 'type'> &
    Record<'_type', ButtonType> & { onlyIcon?: boolean; iconAndText?: boolean }) => {
    const isPrimary = _type === 'primary'
    const isText = _type === 'text'

    const isLarge = size === 'large'
    const isSmall = size === 'small'

    const isCircle = shape === 'circle'

    return [
      // default
      tw`px-3.5 py-1 text-base leading-[normal] h-8 cursor-pointer select-none border inline-block rounded-md shadow border-zinc-200 hover:text-primary hover:border-primary focus:text-primary focus:border-primary active:text-primary active:border-primary focus:outline-none focus:ring-0 transition duration-150 ease-in-out`,
      // primary
      isPrimary &&
        tw`border-primary bg-primary text-white hover:text-white hover:bg-primary/80 hover:border-primary/80 focus:bg-primary/80 focus:border-primary/80 active:bg-primary/80 active:border-primary/80`,
      // text
      isText &&
        tw`border-transparent bg-transparent shadow-none hover:text-current hover:bg-gray-100 hover:border-gray-100 focus:bg-gray-100 active:bg-gray-200`,
      // disabled
      disabled &&
        tw`cursor-not-allowed shadow-none border-zinc-200 bg-black/5 text-black/25 hover:bg-black/5 hover:text-black/25 hover:border-zinc-200 focus:bg-black/5 focus:text-black/25 focus:border-zinc-200 active:bg-black/5 active:text-black/25 active:border-zinc-200`,
      // text disabled
      disabled &&
        isText &&
        tw`border-transparent bg-transparent hover:bg-transparent hover:border-transparent focus:bg-transparent focus:border-transparent active:bg-transparent active:border-transparent`,
      // circle
      isCircle && tw`rounded-full`,
      // large
      isLarge && tw`px-3.5 py-1.5 text-lg h-10`,
      // small
      isSmall && tw`px-1.5 py-0 text-base h-6`,

      onlyIcon &&
        css`
          > * {
            transform: scale(1.143);
          }
        `,
      onlyIcon && tw`w-8 px-0`,
      iconAndText && tw`inline-flex justify-center gap-1 items-center`,
    ]
  },
)

export const Button = React.forwardRef<
  HTMLButtonElement,
  Button & React.AnchorHTMLAttributes<HTMLButtonElement>
>(({ type, htmlType, icon, children, ...props }, ref) => {
  return (
    <StyledButton
      onMouseDown={e => e.preventDefault()}
      {...props}
      onlyIcon={!!icon && !children}
      iconAndText={!!icon && !!children}
      ref={ref}
      _type={type ?? 'default'}
      type={(htmlType as any) ?? 'button'}
    >
      {icon}
      {children}
    </StyledButton>
  )
})

Button.displayName = 'UIButton'
