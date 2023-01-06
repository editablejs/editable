import * as React from 'react'
import tw from 'twin.macro'
import { DismissableLayer } from './dismissable-layer'
import { usePointerOpen } from './hooks/use-pointer-open'
import { PopperAnchor, PopperArrow, PopperContent, Popper, PopperContentProps } from './popper'
import { Portal } from './portal'
import { Presence } from './presence'

export interface TooltipProps extends PopperContentProps {
  content: React.ReactNode
  arrow?: boolean
  defaultOpen?: boolean
  size?: 'small' | 'default' | 'large'
  className?: string
  arrowFill?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
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
  const [trigger, setTrigger] = React.useState<HTMLDivElement | null>(null)
  const [contentRef, setContent] = React.useState<HTMLDivElement | null>(null)

  const [open = false, setOpen] = usePointerOpen({
    triggerEl: trigger,
    contentEl: contentRef,
    defaultOpen: defaultOpen,
  })

  return (
    <Popper>
      <PopperAnchor ref={setTrigger}>{children}</PopperAnchor>
      <Presence present={open}>
        <DismissableLayer onPointerDownOutside={() => setOpen(false)}>
          <Portal>
            <PopperContent
              ref={setContent}
              side={side}
              align={align}
              css={[
                tw`text-white bg-black bg-opacity-80 text-center rounded z-50`,
                size === 'large' && tw`px-3 py-1.5 text-lg`,
                size === 'small' && tw`px-1 py-0.5 text-xs`,
                size === 'default' && tw`px-2 py-1 text-base`,
              ]}
              className={className}
              {...props}
            >
              {content}
              {arrow && <PopperArrow style={{ fill: arrowFill }} />}
            </PopperContent>
          </Portal>
        </DismissableLayer>
      </Presence>
    </Popper>
  )
}
