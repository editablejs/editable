import * as React from 'react'
import { useRouter } from 'next/router'
import { Nav } from './nav'
import { RouteItem, SidebarContext } from './use-route-meta'
import { useActiveSection } from 'hooks/useActiveSection'
import { Footer } from './footer'
import { Toc } from './toc'
import sidebarLearn from '../../sidebarLearn.json'
import sidebarAPIs from '../../sidebarAPIs.json'
import type { TocItem } from 'components/mdx/toc-context'
import Header from 'components/header'

interface PageProps {
  children: React.ReactNode
  toc: Array<TocItem>
}

export function Page({ children, toc }: PageProps) {
  const { asPath } = useRouter()
  const section = useActiveSection()
  let routeTree = sidebarLearn as RouteItem
  switch (section) {
    case 'apis':
      routeTree = sidebarAPIs as unknown as RouteItem
      break
  }
  return (
    <>
      <Header />
      <SidebarContext.Provider value={routeTree}>
        <div tw="grid-cols-only-content lg:grid-cols-sidebar-content 2xl:grid-cols-sidebar-content-toc grid">
          <div tw="fixed top-0 left-0 right-0 z-50 py-0 shadow lg:sticky lg:shadow-none">
            <Nav />
          </div>
          {/* No fallback UI so need to be careful not to suspend directly inside. */}
          <React.Suspense fallback={null}>
            <main tw="min-w-0">
              <div tw="mb-2 h-16 lg:hidden" />
              <article tw="break-words" key={asPath}>
                {children}
              </article>
              <Footer />
            </main>
          </React.Suspense>
          <div tw="hidden lg:max-w-xs 2xl:block">
            {toc.length > 0 && <Toc headings={toc} key={asPath} />}
          </div>
        </div>
      </SidebarContext.Provider>
    </>
  )
}
