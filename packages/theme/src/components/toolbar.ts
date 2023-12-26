
import tw, { css } from 'twin.macro'
import { Button, ButtonProps } from './button'
import { ColorPicker, ColorPickerProps } from './color-picker'
import { Dropdown, DropdownProps } from './dropdown'
import { Select, SelectProps } from './select'
import { Tooltip, TooltipProps } from './tooltip'
import { composeEventHandlers } from '@/utils'
import { HTMLAttributes, Ref, createContext, html, useContext, c } from 'rezon'
import { spread } from 'rezon/directives/spread'

export interface ToolbarButtonProps extends Omit<ButtonProps, 'type'> {
  active?: boolean
  title?: unknown
  onToggle?: () => void
}

export const ToolbarButton = c<ToolbarButtonProps>(({ title, children, onToggle, active, ...props }) => {
  const { side } = useToolbarContext()
  const renderButton = () => Button({
    className: css([
      tw`shadow-none w-7 h-7`,
      css`
              &[data-active='true'] {
                ${tw`text-primary bg-blue-100 border-blue-100 hover:bg-blue-100 hover:text-primary hover:border-blue-100`}
              }
            `,
      !!children && tw`w-auto`,
    ]),
    'data-active': active || undefined,
    onClick: onToggle,
    type: active ? 'primary' : 'text',
    ...props,
    children
  })
  return title ? Tooltip({
    content: title,
    side,
    children: renderButton()
  }) : (
    renderButton()
  )
},
)

export interface ToolbarSeparatorProps extends HTMLAttributes<HTMLDivElement> {
}

export const ToolbarSeparator = c<ToolbarSeparatorProps>((props) => (
  html`<div class="${css(tw`mr-2 ml-2 w-px bg-gray-200`)}" ${spread(props)}>&nbsp;</div>`
))


export interface ToolbarDropdownProps extends DropdownProps {
  title?: unknown
}

export const ToolbarDropdown = c<ToolbarDropdownProps>(
  ({ title, ...props }) => {
    const { side } = useToolbarContext()

    const renderDropdown = () => Dropdown({ className: css(tw`h-7`), ...props })

    return title ? Tooltip({
      content: title,
      side,
      children: renderDropdown()
    }) : (
      renderDropdown()
    )
  },
)


export interface ToolbarSelectProps extends SelectProps {
  title?: unknown
}

export const ToolbarSelect = c<ToolbarSelectProps>(
  ({ title, ...props }) => {
    const { side } = useToolbarContext()

    const renderSelect = () => Select({
      className: css(tw`h-7 border-none hover:bg-gray-100`),
      ...props
    })

    return title ? Tooltip({
      content: title,
      side,
      children: renderSelect()
    }) : (
      renderSelect()
    )
  },
)

export interface ToolbarColorPicker extends Omit<ColorPickerProps, 'renderButton' | 'side'> {
  title?: unknown
}

export const ToolbarColorPicker = c<ToolbarColorPicker>(({ title, ...props }) => {
  const { side } = useToolbarContext()
  return ColorPicker({
    renderButton: ({ children }) => {
      return title ? (
        Tooltip({
          content: title,
          side,
          children
        })
      ) : (
        children
      )
    },
    className: css(tw`h-7`),
    side,
    ...props
  })
},
)

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  mode?: 'inline' | 'normal'
  side?: TooltipProps['side']
}

const StyledToolbar = c<ToolbarProps>(({ mode }) => {

  return html`<div class="${css([
    tw`text-gray-600 z-10 flex items-center gap-1 cursor-default`,
    mode === 'inline' &&
    tw`bg-white shadow-md z-50 px-2 py-1 rounded border-zinc-200 border-solid border`,
  ])}">`
})

export interface ToolbarContext {
  side: TooltipProps['side']
  mode: ToolbarProps['mode']
}

export const ToolbarContext = createContext<ToolbarContext>(null as any)

export const useToolbarContext = () => useContext(ToolbarContext)

export const Toolbar = c<ToolbarProps>(props => {
  const { mode = 'normal' } = props
  const side = props.side ?? mode === 'inline' ? 'top' : 'bottom'
  return ToolbarContext.Provider({
    value: {
      side,
      mode
    },
    children: StyledToolbar({
      ...props,
      onClick: composeEventHandlers(props.onClick, e => e.preventDefault())
    })
  })
})
