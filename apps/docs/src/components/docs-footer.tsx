import NextLink from 'next/link'
import * as React from 'react'
import { removeFromLast } from 'utils/remove-from-last'
import { IconNavArrow } from './icon/nav-arrow'
import { RouteMeta } from './layout/use-route-meta'
import tw from 'twin.macro'
import { useTranslation } from 'react-i18next'

export type DocsPageFooterProps = Pick<RouteMeta, 'route' | 'nextRoute' | 'prevRoute'>

function areEqual(prevProps: DocsPageFooterProps, props: DocsPageFooterProps) {
  return prevProps.route?.path === props.route?.path
}

export const DocsPageFooter = React.memo<DocsPageFooterProps>(function DocsPageFooter({
  nextRoute,
  prevRoute,
  route,
}) {
  if (!route || route?.heading) {
    return null
  }

  return (
    <>
      {prevRoute?.path || nextRoute?.path ? (
        <>
          <div tw="mx-auto grid max-w-7xl grid-cols-1 gap-4 py-4 md:grid-cols-2 md:py-12">
            {prevRoute?.path ? (
              <FooterLink
                type="Previous"
                title={prevRoute.title}
                href={removeFromLast(prevRoute.path, '.')}
              />
            ) : (
              <div />
            )}

            {nextRoute?.path ? (
              <FooterLink
                type="Next"
                title={nextRoute.title}
                href={removeFromLast(nextRoute.path, '.')}
              />
            ) : (
              <div />
            )}
          </div>
        </>
      ) : null}
    </>
  )
},
areEqual)

function FooterLink({
  href,
  title,
  type,
}: {
  href: string
  title: string
  type: 'Previous' | 'Next'
}) {
  const { t } = useTranslation()
  return (
    <NextLink href={href}>
      <a
        css={[
          tw`leading-base text-link dark:text-link-dark focus:text-link dark:focus:text-link-dark focus:bg-highlight focus:border-link dark:focus:bg-highlight-dark dark:focus:border-link-dark focus:ring-blue-40 hover:bg-gray-5 dark:hover:bg-gray-80 flex w-full items-center gap-x-4 rounded-lg border-2 border-transparent px-4 py-6 text-base focus:border-2 focus:border-opacity-100 focus:ring-1 focus:ring-offset-4 active:ring-0 active:ring-offset-0 md:w-80 md:gap-x-6 md:px-5`,
          type === 'Next' && tw`flex-row-reverse justify-self-end text-right`,
        ]}
        className="group"
      >
        <IconNavArrow
          tw="text-gray-30 group-focus:text-link dark:group-focus:text-link-dark inline dark:text-gray-50"
          displayDirection={type === 'Previous' ? 'left' : 'right'}
        />
        <span>
          <span tw="text-secondary dark:text-secondary-dark group-focus:text-link dark:group-focus:text-link-dark block text-sm font-bold uppercase tracking-wide no-underline group-focus:text-opacity-100">
            {t(`docs.${type.toLowerCase()}`)}
          </span>
          <span tw="block text-lg group-hover:underline">{t(title)}</span>
        </span>
      </a>
    </NextLink>
  )
}
