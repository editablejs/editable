import * as React from 'react'
import { useRouter } from 'next/router'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { useActiveSection } from 'hooks/useActiveSection'
import { Feedback } from '../feedback'
import { SidebarContext } from 'components/layout/use-route-meta'
import { SidebarRouteTree } from '../sidebar/sidebar-route-tree'
import type { RouteItem } from '../use-route-meta'
import sidebarLearn from 'sidebarLearn.json'
import sidebarAPIs from 'sidebarAPIs.json'
import tw from 'twin.macro'

declare global {
  interface Window {
    __theme: string
    __setPreferredTheme: (theme: string) => void
  }
}

export default function Nav() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showFeedback, setShowFeedback] = React.useState(false)
  const scrollParentRef = React.useRef<HTMLDivElement>(null)
  const feedbackAutohideRef = React.useRef<any>(null)
  const section = useActiveSection()
  const { asPath } = useRouter()
  const feedbackPopupRef = React.useRef<null | HTMLDivElement>(null)

  // In desktop mode, use the route tree for current route.
  let routeTree: RouteItem = React.useContext(SidebarContext)
  // In mobile mode, let the user switch tabs there and back without navigating.
  // Seed the tab state from the router, but keep it independent.
  const [tab, setTab] = React.useState(section)
  const [prevSection, setPrevSection] = React.useState(section)
  if (prevSection !== section) {
    setPrevSection(section)
    setTab(section)
  }
  if (isOpen) {
    switch (tab) {
      case 'home':
      case 'learn':
        routeTree = sidebarLearn as RouteItem
        break
      case 'apis':
        routeTree = sidebarAPIs as unknown as RouteItem
        break
    }
  }
  // HACK. Fix up the data structures instead.
  if ((routeTree as any).routes.length === 1) {
    routeTree = (routeTree as any).routes[0]
  }

  // While the overlay is open, disable body scroll.
  React.useEffect(() => {
    if (isOpen) {
      const preferredScrollParent = scrollParentRef.current!
      disableBodyScroll(preferredScrollParent)
      return () => enableBodyScroll(preferredScrollParent)
    } else {
      return undefined
    }
  }, [isOpen])

  // Close the overlay on any navigation.
  React.useEffect(() => {
    setIsOpen(false)
  }, [asPath])

  // Also close the overlay if the window gets resized past mobile layout.
  // (This is also important because we don't want to keep the body locked!)
  React.useEffect(() => {
    const media = window.matchMedia(`(max-width: 1023px)`)
    function closeIfNeeded() {
      if (!media.matches) {
        setIsOpen(false)
      }
    }
    closeIfNeeded()
    media.addEventListener('change', closeIfNeeded)
    return () => {
      media.removeEventListener('change', closeIfNeeded)
    }
  }, [])

  // Hide the Feedback widget on any click outside.
  React.useEffect(() => {
    if (!showFeedback) {
      return
    }
    function handleDocumentClickCapture(e: MouseEvent) {
      if (!feedbackPopupRef.current!.contains(e.target as any)) {
        e.stopPropagation()
        e.preventDefault()
        setShowFeedback(false)
      }
    }
    document.addEventListener('click', handleDocumentClickCapture, {
      capture: true,
    })
    return () =>
      document.removeEventListener('click', handleDocumentClickCapture, {
        capture: true,
      })
  }, [showFeedback])

  return (
    <div css={[tw`fixed top-16 flex flex-col lg:bottom-0 lg:h-screen`, isOpen && tw`h-screen`]}>
      <div
        ref={scrollParentRef}
        tw="bg-wash dark:bg-wash-dark grow overflow-y-scroll lg:w-[336px]"
        className="no-bg-scrollbar"
      >
        <aside
          css={[
            tw`z-10 w-full flex-col pb-8 lg:flex lg:max-w-xs lg:grow lg:pb-0`,
            isOpen && tw`z-40 block`,
            !isOpen && tw`hidden lg:block`,
          ]}
        >
          <nav
            role="navigation"
            style={{ '--bg-opacity': '.2' } as React.CSSProperties} // Need to cast here because CSS vars aren't considered valid in TS types (cuz they could be anything)
            tw="w-full grow pr-0 pt-6 md:pt-4 lg:h-auto lg:py-6 lg:pr-5 lg:pt-4"
          >
            {/* No fallback UI so need to be careful not to suspend directly inside. */}
            <React.Suspense fallback={null}>
              <SidebarRouteTree
                // Don't share state between the desktop and mobile versions.
                // This avoids unnecessary animations and visual flicker.
                key={isOpen ? 'mobile-overlay' : 'desktop-or-hidden'}
                routeTree={routeTree}
                isForceExpanded={isOpen}
              />
            </React.Suspense>
            <div tw="h-20" />
          </nav>
          <div tw="fixed bottom-0 hidden lg:block">
            <Feedback />
          </div>
        </aside>
      </div>
    </div>
  )
}
