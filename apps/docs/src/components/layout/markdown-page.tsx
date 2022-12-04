import * as React from 'react'
import { DocsPageFooter } from 'components/docs-footer'
import { Seo } from 'components/seo'
import PageHeading from 'components/page-heading'
import { useRouteMeta } from './use-route-meta'
import { useActiveSection } from '../../hooks/useActiveSection'
import { TocContext } from '../mdx/toc-context'

import(/* webpackPrefetch: true */ '../mdx/code-block/code-block')

export interface MarkdownProps<Frontmatter> {
  meta: Frontmatter & { description?: string }
  children?: React.ReactNode
  toc: Array<{
    url: string
    text: React.ReactNode
    depth: number
  }>
}

export function MarkdownPage<
  T extends { title: string; status?: string } = { title: string; status?: string },
>({ children, meta, toc }: MarkdownProps<T>) {
  const { route, nextRoute, prevRoute } = useRouteMeta()
  const section = useActiveSection()
  const title = meta.title || route?.title || ''
  const description = meta.description || route?.description || ''
  const isHomePage = section === 'home'
  return (
    <>
      <div tw="pl-0">
        <Seo title={title} />
        {!isHomePage && <PageHeading title={title} description={description} tags={route?.tags} />}
        <div tw="px-5 sm:px-12">
          <div tw="mx-auto max-w-7xl">
            <TocContext.Provider value={toc}>{children}</TocContext.Provider>
          </div>
          <DocsPageFooter route={route} nextRoute={nextRoute} prevRoute={prevRoute} />
        </div>
      </div>
    </>
  )
}
