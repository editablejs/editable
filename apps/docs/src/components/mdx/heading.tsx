import cn from 'classnames'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import tw from 'twin.macro'
import { forwardRefWithAs } from 'utils/forward-ref-with-as'
export interface HeadingProps {
  className?: string
  isPageAnchor?: boolean
  children: React.ReactNode
  id?: string
  component?: any
}

const Heading = forwardRefWithAs<HeadingProps, 'div'>(function Heading(
  { component: Comp = 'div', className, children, id, isPageAnchor = true, ...props },
  ref,
) {
  const { t } = useTranslation()
  let label = t('docs.link-for-heading')
  if (typeof children === 'string') {
    label = t('docs.link-for', { name: children })
  }

  return (
    <Comp id={id} {...props} className={cn('mdx-heading', className)} ref={ref}>
      {children}
      {isPageAnchor && (
        <a
          href={`#${id}`}
          aria-label={label}
          title={label}
          css={[Comp === 'h1' && tw`hidden`, Comp !== 'h1' && tw`inline-block`]}
          className="mdx-header-anchor"
        >
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 13 13"
            xmlns="http://www.w3.org/2000/svg"
            tw="text-gray-70 ml-2 h-5 w-5"
          >
            <g fill="currentColor" fillRule="evenodd">
              <path d="M7.778 7.975a2.5 2.5 0 0 0 .347-3.837L6.017 2.03a2.498 2.498 0 0 0-3.542-.007 2.5 2.5 0 0 0 .006 3.543l1.153 1.15c.07-.29.154-.563.25-.773.036-.077.084-.16.14-.25L3.18 4.85a1.496 1.496 0 0 1 .002-2.12 1.496 1.496 0 0 1 2.12 0l2.124 2.123a1.496 1.496 0 0 1-.333 2.37c.16.246.42.504.685.752z" />
              <path d="M5.657 4.557a2.5 2.5 0 0 0-.347 3.837l2.108 2.108a2.498 2.498 0 0 0 3.542.007 2.5 2.5 0 0 0-.006-3.543L9.802 5.815c-.07.29-.154.565-.25.774-.036.076-.084.16-.14.25l.842.84c.585.587.59 1.532 0 2.122-.587.585-1.532.59-2.12 0L6.008 7.68a1.496 1.496 0 0 1 .332-2.372c-.16-.245-.42-.503-.685-.75z" />
            </g>
          </svg>
        </a>
      )}
    </Comp>
  )
})

export const H1 = ({ className, ...props }: HeadingProps) => (
  <Heading component="h1" tw="text-5xl font-bold leading-tight" {...props} className={className} />
)

export const H2 = ({ className, ...props }: HeadingProps) => (
  <Heading
    component="h2"
    tw="dark:text-primary-dark my-6 text-3xl font-bold leading-10 text-primary"
    className={className}
    {...props}
  />
)

export const H3 = ({ className, ...props }: HeadingProps) => (
  <Heading
    component="h3"
    tw="dark:text-primary-dark my-6 text-2xl font-bold leading-9 text-primary"
    className={className}
    {...props}
  />
)

export const H4 = ({ className, ...props }: HeadingProps) => (
  <Heading component="h4" tw="text-xl font-bold leading-9 my-4" className={className} {...props} />
)
