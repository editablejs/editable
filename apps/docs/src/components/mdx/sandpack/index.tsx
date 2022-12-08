import * as React from 'react'
import { createFileMap } from './create-file-map'

const SandpackRoot = React.lazy(() => import('./sandpack-root'))

const SandpackGlimmer = ({ code }: { code: string }) => (
  <div tw=" my-8" className="sandpack sandpack--playground">
    <div className="sp-wrapper">
      <div tw="rounded-lg shadow-lg dark:shadow-lg-dark">
        <div tw="bg-wash dark:bg-card-dark border-border dark:border-border-dark relative z-10 flex h-10 items-center justify-between rounded-t-lg rounded-b-none border-b">
          <div tw="px-4 lg:px-6">
            <div className="sp-tabs"></div>
          </div>
          <div tw="flex grow items-center justify-end px-3 text-right"></div>
        </div>
        <div tw="flex min-h-[216px] flex-wrap items-stretch" className="sp-layout ">
          <div tw="h-auto max-h-[406px] overflow-auto" className="sp-stack sp-editor">
            <div className="sp-code-editor">
              <div className="sp-cm sp-pristine">
                <div className="cm-editor">
                  <div>
                    <div tw="min-h-[192px] pl-9 sticky" className="cm-gutters">
                      <div
                        tw="whitespace-pre"
                        className="cm-gutter cm-lineNumbers sp-pre-placeholder"
                      >
                        {code}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div tw="order-last h-auto max-h-[406px] xl:order-2" className="sp-stack">
            <div tw="bg-card dark:bg-wash-dark relative h-full overflow-auto rounded-b-lg p-0 sm:p-2 md:p-4 lg:rounded-b-none lg:p-8"></div>
          </div>
          {code.split('\n').length > 16 && (
            <div tw="dark:border-card-dark bg-wash dark:bg-card-dark border-b relative top-0 z-10 order-2 flex h-[45px] w-full items-center justify-between rounded-t-none p-1 text-base xl:order-last"></div>
          )}
        </div>
      </div>
    </div>
  </div>
)

export default React.memo(function SandpackWrapper(props: any): any {
  const codeSnippet = createFileMap(React.Children.toArray(props.children))

  // To set the active file in the fallback we have to find the active file first.
  // If there are no active files we fallback to App.js as default.
  let activeCodeSnippet = Object.keys(codeSnippet).filter(
    fileName => codeSnippet[fileName]?.active === true && codeSnippet[fileName]?.hidden === false,
  )
  let activeCode
  if (!activeCodeSnippet.length) {
    activeCode = codeSnippet['/App.js'].code
  } else {
    activeCode = codeSnippet[activeCodeSnippet[0]].code
  }

  return (
    <React.Suspense fallback={<SandpackGlimmer code={activeCode} />}>
      <SandpackRoot {...props} />
    </React.Suspense>
  )
})
