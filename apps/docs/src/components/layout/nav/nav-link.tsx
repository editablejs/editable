import * as React from 'react'
import { ExternalLink } from 'components/external-link'
import NextLink from 'next/link'
import tw, { css } from 'twin.macro'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  isActive: boolean
  target?: string
  className?: string
}

const getClasses = (isActive: boolean) => [
  tw`inline-flex w-full cursor-pointer items-center border-b-2 justify-center text-base leading-9 px-3 py-0.5 hover:text-link dark:hover:text-link-dark whitespace-nowrap`,
  isActive && tw`text-link border-link dark:text-link-dark dark:border-link-dark font-bold`,
  !isActive &&
    css`
      border-color: transparent !important;
    `,
]

export default function NavLink({ href, children, isActive, target, className }: NavLinkProps) {
  const classes = getClasses(isActive)
  if (href.startsWith('https://')) {
    return (
      <ExternalLink href={href} css={classes} className={className} target={target}>
        {children}
      </ExternalLink>
    )
  }

  return (
    <NextLink href={href} target={target} className={className}>
      <a css={classes}>{children}</a>
    </NextLink>
  )
}
