import * as React from 'react'
import { ExternalLink } from './external-link'

const bannerText = 'Support Ukraine 🇺🇦'
const bannerLink = 'https://opensource.fb.com/support-ukraine'
const bannerLinkText = 'Help Provide Humanitarian Aid to Ukraine'

export default function SocialBanner() {
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    function patchedScrollTo(x: number, y: number) {
      if (y === 0) {
        // We're trying to reset scroll.
        // If we already scrolled past the banner, consider it as y = 0.
        const bannerHeight = ref.current?.offsetHeight ?? 0 // Could be zero (e.g. mobile)
        y = Math.min(window.scrollY, bannerHeight)
      }
      return realScrollTo(x, y)
    }
    const realScrollTo = window.scrollTo
    ;(window as any).scrollTo = patchedScrollTo
    return () => {
      ;(window as any).scrollTo = realScrollTo
    }
  }, [])
  return (
    <div
      ref={ref}
      tw="h-[40px] hidden lg:flex w-full bg-gray-100 dark:bg-gray-700 text-base md:text-lg py-2 sm:py-0 items-center justify-center flex-col sm:flex-row z-[100]"
    >
      <div tw="hidden sm:block">{bannerText}</div>
      <ExternalLink
        tw="text-link dark:text-link-dark ml-0 hover:underline sm:ml-1"
        href={bannerLink}
      >
        <div tw="inline sm:hidden">🇺🇦 </div>
        {bannerLinkText}
        <span tw="hidden sm:inline">.</span>
      </ExternalLink>
    </div>
  )
}
