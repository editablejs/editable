/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react'
import { useSandpack, SandpackStack } from '@codesandbox/sandpack-react'

import { ErrorMessage } from './error-message'
import { SandpackConsole } from './console'
import type { LintDiagnostic } from './use-sandpack-lint'
import { LoadingOverlay } from './loading-overlay'
import tw from 'twin.macro'
import { useTranslation } from 'react-i18next'

type CustomPreviewProps = {
  className?: string
  isExpanded: boolean
  lintErrors: LintDiagnostic
}

function useDebounced(value: any): any {
  const ref = React.useRef<any>(null)
  const [saved, setSaved] = React.useState(value)
  React.useEffect(() => {
    clearTimeout(ref.current)
    ref.current = setTimeout(() => {
      setSaved(value)
    }, 300)
  }, [value])
  return saved
}

export function Preview({ isExpanded, className, lintErrors }: CustomPreviewProps) {
  const { sandpack, listen } = useSandpack()
  const [bundlerIsReady, setBundlerIsReady] = React.useState(false)
  const [showLoading, setShowLoading] = React.useState(false)
  const [iframeComputedHeight, setComputedAutoHeight] = React.useState<number | null>(null)

  let {
    error: rawError,
    registerBundler,
    unregisterBundler,
    errorScreenRegisteredRef,
    openInCSBRegisteredRef,
    loadingScreenRegisteredRef,
    status,
  } = sandpack

  if (rawError && rawError.message === '_csbRefreshUtils.prelude is not a function') {
    // Work around a noisy internal error.
    rawError = null
  }

  // Memoized because it's fed to debouncing.
  const firstLintError = React.useMemo(() => {
    if (lintErrors.length === 0) {
      return null
    } else {
      const { line, column, message } = lintErrors[0]
      return {
        title: 'Lint Error',
        message: `${line}:${column} - ${message}`,
      }
    }
  }, [lintErrors])

  if (rawError == null || rawError.title === 'Runtime Exception') {
    if (firstLintError !== null) {
      rawError = firstLintError
    }
  }

  if (rawError != null && rawError.title === 'Runtime Exception') {
    rawError.title = 'Runtime Error'
  }

  // It changes too fast, causing flicker.
  const error = useDebounced(rawError)

  const clientId = React.useId()
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null)

  // SandpackPreview immediately registers the custom screens/components so the bundler does not render any of them
  // TODO: why are we doing this during render?
  openInCSBRegisteredRef.current = true
  errorScreenRegisteredRef.current = true
  loadingScreenRegisteredRef.current = true

  const sandpackIdle = sandpack.status === 'idle'

  React.useEffect(function createBundler() {
    const iframeElement = iframeRef.current!
    registerBundler(iframeElement, clientId)

    return () => {
      unregisterBundler(clientId)
    }
  }, [])

  React.useEffect(
    function bundlerListener() {
      let timeout: ReturnType<typeof setTimeout>

      const unsubscribe = listen(message => {
        if (message.type === 'resize') {
          setComputedAutoHeight(message.height)
        } else if (message.type === 'start') {
          if (message.firstLoad) {
            setBundlerIsReady(false)
          }

          /**
           * The spinner component transition might be longer than
           * the bundler loading, so we only show the spinner if
           * it takes more than 1s to load the bundler.
           */
          timeout = setTimeout(() => {
            setShowLoading(true)
          }, 500)
        } else if (message.type === 'done') {
          setBundlerIsReady(true)
          setShowLoading(false)
          clearTimeout(timeout)
        }
      }, clientId)

      return () => {
        clearTimeout(timeout)
        setBundlerIsReady(false)
        setComputedAutoHeight(null)
        unsubscribe()
      }
    },
    [sandpackIdle],
  )

  // WARNING:
  // The layout and styling here is convoluted and really easy to break.
  // If you make changes to it, you need to test different cases:
  // - Content -> (compile | runtime) error -> content editing flow should work.
  // - Errors should expand parent height rather than scroll.
  // - Long sandboxes should scroll unless "show more" is toggled.
  // - Expanded sandboxes ("show more") have sticky previews and errors.
  // - Sandboxes have autoheight based on content.
  // - That autoheight should be measured correctly! (Check some long ones.)
  // - You shouldn't see nested scrolls (that means autoheight is borked).
  // - Ideally you shouldn't see a blank preview tile while recompiling.
  // - Container shouldn't be horizontally scrollable (even while loading).
  // - It should work on mobile.
  // The best way to test it is to actually go through some challenges.

  const hideContent = error || !iframeComputedHeight || !bundlerIsReady

  const iframeWrapperPosition = (): React.CSSProperties => {
    if (hideContent) {
      return { position: 'relative' }
    }

    if (isExpanded) {
      return { position: 'sticky', top: '2em' }
    }

    return {}
  }

  const { t } = useTranslation()

  return (
    <SandpackStack className={className}>
      <div
        css={[
          tw`p-0 sm:p-2 md:p-4 lg:p-8 bg-card dark:bg-wash-dark h-full relative md:rounded-b-lg lg:rounded-b-none`,
          !isExpanded && (error || bundlerIsReady) && tw`overflow-auto`,
        ]}
      >
        <div style={iframeWrapperPosition()}>
          <iframe
            ref={iframeRef}
            css={[
              tw`rounded-t-none bg-white md:shadow-md sm:rounded-lg w-full max-w-full transition-opacity`,
              // We can't *actually* hide content because that would
              // break calculating the computed height in the iframe
              // (which we're using for autosizing). This is noticeable
              // if you make a compiler error and then fix it with code
              // that expands the content. You want to measure that.
              hideContent && tw`absolute opacity-0 pointer-events-none duration-75`,
              !hideContent && tw`opacity-100 duration-150`,
            ]}
            title={t('docs.sandpack.preview-sandpack') ?? ''}
            style={{
              height: iframeComputedHeight || '15px',
              zIndex: isExpanded ? 'initial' : -1,
            }}
          />
        </div>

        {error && (
          <div css={[tw`z-50`, isExpanded && tw`sticky top-8`]}>
            <ErrorMessage error={error} />
          </div>
        )}

        <LoadingOverlay
          clientId={clientId}
          dependenciesLoading={!bundlerIsReady && iframeComputedHeight === null}
          forceLoading={showLoading}
        />
      </div>
      <SandpackConsole visible={!error} />
    </SandpackStack>
  )
}
