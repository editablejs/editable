/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react'
import { IconNavArrow } from 'components/icon/nav-arrow'
import Link from 'next/link'
import { ExternalLink } from 'components/external-link'
import tw from 'twin.macro'
import { useTranslation } from 'react-i18next'

interface SidebarLinkProps {
  href: string
  selected?: boolean
  title: string
  level: number
  wip: boolean | undefined
  icon?: React.ReactNode
  heading?: boolean
  isExpanded?: boolean
  isBreadcrumb?: boolean
  hideArrow?: boolean
  isPending: boolean
  target?: string
  onClick?: () => void
}

export function SidebarLink({
  href,
  selected = false,
  title,
  wip,
  level,
  heading = false,
  isExpanded,
  isBreadcrumb,
  hideArrow,
  isPending,
  target,
  onClick,
}: SidebarLinkProps) {
  const ref = React.useRef<HTMLAnchorElement>(null)
  const { t } = useTranslation()
  React.useEffect(() => {
    if (selected && ref && ref.current) {
      // @ts-ignore
      if (typeof ref.current.scrollIntoViewIfNeeded === 'function') {
        // @ts-ignore
        ref.current.scrollIntoViewIfNeeded()
      }
    }
  }, [ref, selected])

  if (href.startsWith('https://')) {
    target = '_blank'
  }
  const renderChildren = () => {
    return (
      <>
        {/* This here needs to be refactored ofc */}
        <span css={[wip && tw`text-gray-400 dark:text-gray-500`]}>{t(title)}</span>
        {isExpanded != null && !heading && !hideArrow && (
          <span css={[tw`pr-1`, isExpanded && tw`text-link`, !isExpanded && tw`text-gray-30`]}>
            <IconNavArrow displayDirection={isExpanded ? 'down' : 'right'} />
          </span>
        )}
      </>
    )
  }

  const classes = [
    tw`p-2 pr-2 w-full cursor-pointer rounded-none lg:rounded-r-lg text-left hover:bg-gray-5 dark:hover:bg-gray-80 relative flex items-center justify-between`,
    heading && tw`my-6`,
    heading && !isBreadcrumb && tw`text-primary dark:text-primary-dark`,
    level > 0 && tw`pl-6 text-sm`,
    level < 2 && tw`pl-5`,
    level === 0 && tw`text-base font-bold`,
    level === 0 && !selected && tw`dark:text-primary-dark text-primary `,
    level === 1 && selected && tw`text-link dark:text-link-dark text-base`,
    heading && tw`dark:text-primary-dark text-primary`,
    !selected && !heading && tw`text-secondary dark:text-secondary-dark text-base`,
    selected &&
      tw`text-link dark:text-link-dark bg-highlight dark:bg-highlight-dark border-blue-40 hover:bg-highlight hover:text-link dark:hover:bg-highlight-dark dark:hover:text-link-dark text-base`,
    isPending && tw`dark:bg-gray-70 bg-gray-300 dark:hover:bg-gray-70 hover:bg-gray-300`,
  ]
  if (target === '_blank') {
    return (
      <ExternalLink href={href} css={classes}>
        {renderChildren()}
      </ExternalLink>
    )
  }

  const link = (
    <a
      ref={ref}
      title={t(title) ?? ''}
      target={target}
      aria-current={selected ? 'page' : undefined}
      css={classes}
      onClick={onClick}
    >
      {renderChildren()}
    </a>
  )

  if (!href) return link

  return <Link href={href}>{link}</Link>
}
