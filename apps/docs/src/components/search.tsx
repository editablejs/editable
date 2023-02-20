// @ts-ignore
import { IconSearch } from 'components/icon/search'
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { siteConfig } from 'siteConfig'

export interface SearchProps {
  appId?: string
  apiKey?: string
  indexName?: string
  searchParameters?: any
  renderModal?: boolean
}

function Hit({ hit, children }: any) {
  return (
    <Link href={hit.url.replace()}>
      <a>{children}</a>
    </Link>
  )
}

function Kbd(props: { children?: React.ReactNode }) {
  return (
    <kbd
      tw="bg-wash dark:bg-wash-dark text-gray-30 mr-1 inline-flex h-6 w-6 items-center justify-center rounded border border-transparent p-0  text-center align-middle text-xs"
      {...props}
    />
  )
}

// Copy-pasted from @docsearch/react to avoid importing the whole bundle.
// Slightly trimmed to features we use.
// (c) Algolia, Inc.
function isEditingContent(event: any) {
  var element = event.target
  var tagName = element.tagName
  return (
    element.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'SELECT' ||
    tagName === 'TEXTAREA'
  )
}
function useDocSearchKeyboardEvents({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}) {
  React.useEffect(() => {
    function onKeyDown(event: any) {
      function open() {
        // We check that no other DocSearch modal is showing before opening
        // another one.
        if (!document.body.classList.contains('DocSearch--active')) {
          onOpen()
        }
      }
      if (
        (event.keyCode === 27 && isOpen) ||
        (event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
        (!isEditingContent(event) && event.key === '/' && !isOpen)
      ) {
        event.preventDefault()
        if (isOpen) {
          onClose()
        } else if (!document.body.classList.contains('DocSearch--active')) {
          open()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return function () {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onOpen, onClose])
}

const options = {
  appId: siteConfig.algolia.appId,
  apiKey: siteConfig.algolia.apiKey,
  indexName: siteConfig.algolia.indexName,
}
let DocSearchModal: any = null
export function Search({
  searchParameters = {
    hitsPerPage: 5,
  },
}: SearchProps) {
  const [isShowing, setIsShowing] = React.useState(false)

  const importDocSearchModalIfNeeded = React.useCallback(function importDocSearchModalIfNeeded() {
    if (DocSearchModal) {
      return Promise.resolve()
    }

    // @ts-ignore
    return import('@docsearch/react/modal').then(({ DocSearchModal: Modal }) => {
      DocSearchModal = Modal
    })
  }, [])

  const onOpen = React.useCallback(
    function onOpen() {
      importDocSearchModalIfNeeded().then(() => {
        setIsShowing(true)
      })
    },
    [importDocSearchModalIfNeeded, setIsShowing],
  )

  const onClose = React.useCallback(
    function onClose() {
      setIsShowing(false)
    },
    [setIsShowing],
  )

  useDocSearchKeyboardEvents({ isOpen: isShowing, onOpen, onClose })
  const { t } = useTranslation()
  return (
    <>
      <Head>
        <link rel="preconnect" href={`https://${options.appId}-dsn.algolia.net`} />
      </Head>

      <button
        aria-label={t('docs.search') ?? 'Search'}
        type="button"
        tw="ml-4 inline-flex items-center p-1 text-lg md:hidden lg:ml-6"
        onClick={onOpen}
      >
        <IconSearch tw="align-middle" />
      </button>

      <button
        type="button"
        tw="bg-secondary-button dark:bg-gray-80 cursor-pointer text-gray-30 relative hidden h-10 w-full items-center rounded-lg py-1 pl-4 pr-0.5 text-left align-middle text-sm shadow-inner outline-none focus:outline-none focus:ring md:flex betterhover:hover:bg-opacity-80"
        onClick={onOpen}
      >
        <IconSearch tw="text-gray-30 hover:text-gray-70 mr-3 shrink-0 align-middle" />
        {t('docs.search')}
        <span tw="items-center ml-auto hidden sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      {isShowing &&
        createPortal(
          <DocSearchModal
            {...options}
            initialScrollY={window.scrollY}
            searchParameters={searchParameters}
            onClose={onClose}
            navigator={{
              navigate({ itemUrl }: any) {
                Router.push(itemUrl)
              },
            }}
            transformItems={(items: any[]) => {
              return items.map(item => {
                const url = new URL(item.url)
                return {
                  ...item,
                  url: item.url.replace(url.origin, '').replace('#__next', ''),
                }
              })
            }}
            hitComponent={Hit}
          />,
          document.body,
        )}
    </>
  )
}
