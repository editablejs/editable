import * as React from 'react'
import { FileTabs, useSandpack, useSandpackNavigation } from '@codesandbox/sandpack-react'
import { OpenInCodeSandboxButton } from './open-in-code-sandbox-button'
import { ResetButton } from './reset-button'
import { DownloadButton } from './download-button'
import { IconChevron } from '../../icon/chevron'
import { Listbox } from '@headlessui/react'
import tw from 'twin.macro'
import { useTranslation } from 'react-i18next'

export function useEvent(fn: any): any {
  const ref = React.useRef(null)
  React.useInsertionEffect(() => {
    ref.current = fn
  }, [fn])
  return React.useCallback((...args: any) => {
    const f = ref.current!
    // @ts-ignore
    return f(...args)
  }, [])
}

const getFileName = (filePath: string): string => {
  const lastIndexOfSlash = filePath.lastIndexOf('/')
  return filePath.slice(lastIndexOfSlash + 1)
}

export function NavigationBar({ providedFiles }: { providedFiles: Array<string> }) {
  const { sandpack } = useSandpack()
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const tabsRef = React.useRef<HTMLDivElement | null>(null)
  // By default, show the dropdown because all tabs may not fit.
  // We don't know whether they'll fit or not until after hydration:
  const [showDropdown, setShowDropdown] = React.useState(true)
  const { activeFile, setActiveFile, visibleFiles, clients } = sandpack
  const clientId = Object.keys(clients)[0]
  const { refresh } = useSandpackNavigation(clientId)
  const isMultiFile = visibleFiles.length > 1
  const hasJustToggledDropdown = React.useRef(false)

  // Keep track of whether we can show all tabs or just the dropdown.
  const onContainerResize = useEvent((containerWidth: number) => {
    if (hasJustToggledDropdown.current === true) {
      // Ignore changes likely caused by ourselves.
      hasJustToggledDropdown.current = false
      return
    }
    if (tabsRef.current === null) {
      // Some ResizeObserver calls come after unmount.
      return
    }
    const tabsWidth = tabsRef.current.getBoundingClientRect().width
    const needsDropdown = tabsWidth >= containerWidth
    if (needsDropdown !== showDropdown) {
      hasJustToggledDropdown.current = true
      setShowDropdown(needsDropdown)
    }
  })

  React.useEffect(() => {
    if (isMultiFile) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry.contentBoxSize) {
            const contentBoxSize = Array.isArray(entry.contentBoxSize)
              ? entry.contentBoxSize[0]
              : entry.contentBoxSize
            const width = contentBoxSize.inlineSize
            onContainerResize(width)
          }
        }
      })
      const container = containerRef.current!
      resizeObserver.observe(container)
      return () => resizeObserver.unobserve(container)
    } else {
      return
    }
  }, [isMultiFile, onContainerResize])

  const { t } = useTranslation()

  const handleReset = () => {
    /**
     * resetAllFiles must come first, otherwise
     * the previous content will appears for a second
     * when the iframe loads.
     *
     * Plus, it should only prompts if there's any file changes
     */
    if (sandpack.editorState === 'dirty' && confirm(t('docs.sandpack.reset-all') ?? '')) {
      sandpack.resetAllFiles()
    }

    refresh()
  }

  return (
    <div tw="bg-wash dark:bg-card-dark border-border dark:border-border-dark relative z-10 flex items-center justify-between rounded-t-lg border-b text-lg">
      <div tw="min-w-0 flex-1 grow px-4 lg:px-6">
        <Listbox value={activeFile} onChange={setActiveFile}>
          <div ref={containerRef}>
            <div tw="relative overflow-hidden">
              <div
                ref={tabsRef}
                css={
                  // The container for all tabs is always in the DOM, but
                  // not always visible. This lets us measure how much space
                  // the tabs would take if displayed. We use this to decide
                  // whether to keep showing the dropdown, or show all tabs.
                  [tw`w-[fit-content]`, showDropdown && tw`invisible`]
                }
              >
                <FileTabs />
              </div>
              <Listbox.Button as={React.Fragment as any}>
                {({ open }) => (
                  // If tabs don't fit, display the dropdown instead.
                  // The dropdown is absolutely positioned inside the
                  // space that's taken by the (invisible) tab list.
                  <button css={[tw`absolute top-0 left-[2px]`, !showDropdown && tw`invisible`]}>
                    <span
                      tw="text-link dark:text-link-dark border-link dark:border-link-dark mt-px -mb-px flex h-full items-center truncate border-b py-2 px-1 text-base leading-tight"
                      style={{ maxWidth: '160px' }}
                    >
                      {getFileName(activeFile)}
                      {isMultiFile && (
                        <span tw="ml-2">
                          <IconChevron displayDirection={open ? 'up' : 'down'} />
                        </span>
                      )}
                    </span>
                  </button>
                )}
              </Listbox.Button>
            </div>
          </div>
          {isMultiFile && showDropdown && (
            <Listbox.Options tw="bg-card dark:bg-card-dark border border-border dark:border-border-dark absolute left-0 right-0 mx-0 mt-0.5 rounded-sm rounded-b-lg px-2 shadow-md">
              {visibleFiles.map((filePath: string) => (
                <Listbox.Option key={filePath} value={filePath} as={React.Fragment as any}>
                  {({ active }) => (
                    <li
                      css={[
                        tw`mx-2 my-4 cursor-pointer text-base`,
                        active && tw`text-link dark:text-link-dark`,
                      ]}
                    >
                      {getFileName(filePath)}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          )}
        </Listbox>
      </div>
      <div tw="flex items-center justify-end px-3 text-right" translate="yes">
        <DownloadButton providedFiles={providedFiles} />
        <ResetButton onReset={handleReset} />
        <OpenInCodeSandboxButton />
      </div>
    </div>
  )
}
