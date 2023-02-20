import * as React from 'react'
import { flushSync } from 'react-dom'
import {
  useSandpack,
  useActiveCode,
  SandpackCodeEditor,
  // SandpackReactDevTools,
  SandpackLayout,
} from '@codesandbox/sandpack-react'
import cn from 'classnames'

import { IconChevron } from 'components/icon/chevron'
import { NavigationBar } from './navigation-bar'
import { Preview } from './preview'

import { useSandpackLint } from './use-sandpack-lint'
import tw from 'twin.macro'
import { useTranslation } from 'react-i18next'

export const CustomPreset = React.memo(function CustomPreset({
  showDevTools,
  onDevToolsLoad,
  devToolsLoaded,
  providedFiles,
}: {
  showDevTools: boolean
  devToolsLoaded: boolean
  onDevToolsLoad: () => void
  providedFiles: Array<string>
}) {
  const { lintErrors, lintExtensions } = useSandpackLint()
  const { sandpack } = useSandpack()
  const { code } = useActiveCode()
  const { activeFile } = sandpack
  const lineCountRef = React.useRef<{ [key: string]: number }>({})
  if (!lineCountRef.current[activeFile]) {
    lineCountRef.current[activeFile] = code.split('\n').length
  }
  const lineCount = lineCountRef.current[activeFile]
  const isExpandable = lineCount > 16
  return (
    <SandboxShell
      showDevTools={showDevTools}
      onDevToolsLoad={onDevToolsLoad}
      devToolsLoaded={devToolsLoaded}
      providedFiles={providedFiles}
      lintErrors={lintErrors}
      lintExtensions={lintExtensions}
      isExpandable={isExpandable}
    />
  )
})

const SandboxShell = React.memo(function SandboxShell({
  showDevTools,
  onDevToolsLoad,
  devToolsLoaded,
  providedFiles,
  lintErrors,
  lintExtensions,
  isExpandable,
}: {
  showDevTools: boolean
  devToolsLoaded: boolean
  onDevToolsLoad: () => void
  providedFiles: Array<string>
  lintErrors: Array<any>
  lintExtensions: Array<any>
  isExpandable: boolean
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { t } = useTranslation()
  return (
    <>
      <div tw="rounded-lg shadow-lg dark:shadow-lg-dark" ref={containerRef}>
        <NavigationBar providedFiles={providedFiles} />
        <SandpackLayout
          css={[!(isExpandable || isExpanded) && tw`overflow-hidden rounded-b-lg`]}
          className={cn(
            showDevTools && devToolsLoaded && 'sp-layout-devtools',
            isExpanded && 'sp-layout-expanded',
          )}
        >
          <Editor lintExtensions={lintExtensions} />
          <Preview tw="order-last xl:order-2" isExpanded={isExpanded} lintErrors={lintErrors} />
          {(isExpandable || isExpanded) && (
            <button
              translate="yes"
              tw="dark:border-card-dark bg-wash dark:bg-card-dark border relative top-0 z-10 order-2 flex w-full items-center justify-between p-1 text-base xl:order-last"
              className="sandpack-expand"
              onClick={() => {
                const nextIsExpanded = !isExpanded
                flushSync(() => {
                  setIsExpanded(nextIsExpanded)
                })
                if (!nextIsExpanded && containerRef.current !== null) {
                  // @ts-ignore
                  if (containerRef.current.scrollIntoViewIfNeeded) {
                    // @ts-ignore
                    containerRef.current.scrollIntoViewIfNeeded()
                  } else {
                    containerRef.current.scrollIntoView({
                      block: 'nearest',
                      inline: 'nearest',
                    })
                  }
                }
              }}
            >
              <span tw="dark:text-primary-dark flex p-2 leading-[20px] text-primary focus:outline-none">
                <IconChevron
                  tw="mr-1.5 inline text-xl"
                  displayDirection={isExpanded ? 'up' : 'down'}
                />
                {isExpanded ? t('docs.sandpack.show-less') : t('docs.sandpack.show-more')}
              </span>
            </button>
          )}
        </SandpackLayout>

        {/* {showDevTools && (
          // @ts-ignore TODO(@danilowoz): support devtools
          <SandpackReactDevTools onLoadModule={onDevToolsLoad} />
        )} */}
      </div>
    </>
  )
})

const Editor = React.memo(function Editor({ lintExtensions }: { lintExtensions: Array<any> }) {
  return (
    <SandpackCodeEditor
      showLineNumbers
      showInlineErrors
      showTabs={false}
      showRunButton={false}
      extensions={lintExtensions}
    />
  )
})
