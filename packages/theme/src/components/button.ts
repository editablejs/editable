import { html, virtual, RefObject, ButtonHTMLAttributes } from 'rezon'
import { ref } from 'rezon/directives/ref'
import { spread } from 'rezon/directives/spread'
import { createStyles } from '../styles'
import tw, { TwStyle, css } from 'twin.macro'

type ButtonType = 'primary' | 'default' | 'text'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'type' | 'className'> {
  className?: string | TwStyle
  icon?: unknown
  htmlType?: 'button' | 'submit' | 'reset'
  type?: ButtonType
  shape?: 'circle' | 'round'
  title?: unknown
}

interface ButtonStylesProps {
  type?: ButtonType
  disabled?: boolean
  shape?: 'circle' | 'round'
  hasIcon?: boolean
  hasChildren?: boolean
  className?: string | TwStyle
}

const useButtonStyles = createStyles<ButtonStylesProps>(({ type, disabled, shape, hasIcon, hasChildren, className }) => {

  return [
    tw`px-3.5 py-1 text-base leading-[normal] h-8 cursor-pointer select-none border inline-block rounded-md shadow border-zinc-200 hover:text-primary hover:border-primary focus:text-primary focus:border-primary active:text-primary active:border-primary focus:outline-none focus:ring-0 transition duration-150 ease-in-out`,
    type === 'primary' && tw`border-primary bg-primary text-white hover:text-white hover:bg-primary/80 hover:border-primary/80 focus:bg-primary/80 focus:border-primary/80 active:bg-primary/80 active:border-primary/80`,
    type === 'text' && tw`border-transparent bg-transparent shadow-none hover:text-current hover:bg-gray-100 hover:border-gray-100 focus:bg-gray-100 active:bg-gray-200`,
    disabled && tw`cursor-not-allowed shadow-none border-zinc-200 bg-black/5 text-black/25 hover:bg-black/5 hover:text-black/25 hover:border-zinc-200 focus:bg-black/5 focus:text-black/25 focus:border-zinc-200 active:bg-black/5 active:text-black/25 active:border-zinc-200`,
    disabled && type === 'text' && tw`border-transparent bg-transparent hover:bg-transparent hover:border-transparent focus:bg-transparent focus:border-transparent active:bg-transparent active:border-transparent`,
    shape === 'circle' && tw`rounded-full`,
    hasIcon && !hasChildren && css`
    > * {
      transform: scale(1.143);
    }

    ${tw`w-8 px-0`}`,
    hasIcon && hasChildren && tw`inline-flex justify-center gap-1 items-center`,
    className,
  ]
})

export const Button = virtual<ButtonProps>((props) => {
  const { type, shape, htmlType, className, children, icon, ...rest } = props
  const styles = useButtonStyles({
    type: type,
    disabled: props.disabled,
    shape: shape,
    hasIcon: icon != null,
    hasChildren: children != null,
    className: className,
  })
  return html`<button type=${htmlType} class=${styles} ${spread(rest)}>${icon}${children}</button>`
})

