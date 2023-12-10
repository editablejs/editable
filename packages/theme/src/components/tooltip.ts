import tw, { css } from 'twin.macro'
import { DismissableLayer } from './dismissable-layer'
import { usePointerOpen } from '@/hooks/use-pointer-open'
import { PopperAnchor, PopperArrow, PopperContent, Popper, PopperContentProps } from './popper'
import { Portal } from './portal'
import { Presence } from './presence'
import { useState, virtual } from 'rezon'

export interface TooltipProps extends PopperContentProps {
  content: unknown
  arrow?: boolean
  defaultOpen?: boolean
  size?: 'small' | 'default' | 'large'
  className?: string
  arrowFill?: string
}

export const Tooltip = virtual<TooltipProps>(({
  children,
  side = 'bottom',
  align = 'center',
  arrow = true,
  arrowFill,
  content,
  defaultOpen = false,
  size = 'default',
  className,
  ...props
}) => {
  const [trigger, setTrigger] = useState<HTMLDivElement | null>(null)
  const [contentRef, setContent] = useState<HTMLDivElement | null>(null)

  const [open = false, setOpen] = usePointerOpen({
    triggerEl: trigger,
    contentEl: contentRef,
    defaultOpen: defaultOpen,
  })

  return Popper({
    children: [
      PopperAnchor({
        ref: setTrigger,
        children,
      }),
      Presence({
        present: open,
        children: DismissableLayer({
          onPointerDownOutside: () => setOpen(false),
          children: Portal({
            children: PopperContent({
              ref: setContent,
              side,
              align,
              className: css([
                tw`text-white bg-black bg-opacity-80 text-center rounded z-50`,
                size === 'large' && tw`px-3 py-1.5 text-lg`,
                size === 'small' && tw`px-1 py-0.5 text-xs`,
                size === 'default' && tw`px-2 py-1 text-base`,
              ], className),
              ...props,
              children: [content, arrow ? PopperArrow({ style: { fill: arrowFill } }) : ''],
            }),
          }),
        }),
      }),
    ],
  })
})
