import * as React from 'react'
import i18n from 'i18next'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Head from 'next/head'
import GlobalStyles from '../styles/global'
import '../styles/index.css'
import '../styles/sandpack.css'
import '../i18n'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  i18n.changeLanguage(router.locale)

  React.useEffect(() => {
    // Taken from StackOverflow. Trying to detect both Safari desktop and mobile.
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafari) {
      // This is kind of a lie.
      // We still rely on the manual Next.js scrollRestoration logic.
      // However, we *also* don't want Safari grey screen during the back swipe gesture.
      // Seems like it doesn't hurt to enable auto restore *and* Next.js logic at the same time.
      history.scrollRestoration = 'auto'
    } else {
      // For other browsers, let Next.js set scrollRestoration to 'manual'.
      // It seems to work better for Chrome and Firefox which don't animate the back swipe.
    }
  }, [])

  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      // ga('set', 'page', url)
      // ga('send', 'pageview')
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <GlobalStyles />
      <Head>
        <meta
          name="viewport"
          content="viewport-fit=cover,width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
