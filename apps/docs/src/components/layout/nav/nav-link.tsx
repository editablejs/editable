import * as React from 'react'
import { ExternalLink } from 'components/external-link'
import NextLink from 'next/link'
import tw from 'twin.macro'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  isActive: boolean
  target?: string
}

export default function NavLink({ href, children, isActive, target }: NavLinkProps) {
  const classes = [
    tw`inline-flex w-full cursor-pointer items-center border-b-2 justify-center text-base leading-9 px-3 py-0.5 hover:text-link dark:hover:text-link-dark whitespace-nowrap`,
    isActive && tw`text-link border-link dark:text-link-dark dark:border-link-dark font-bold`,
    !isActive && tw`border-transparent`,
  ]

  if (href.startsWith('https://')) {
    return (
      <ExternalLink href={href} css={classes} target={target}>
        {children}
      </ExternalLink>
    )
  }

  return (
    <NextLink href={href} target={target}>
      <a css={classes}>{children}</a>
    </NextLink>
  )
}
