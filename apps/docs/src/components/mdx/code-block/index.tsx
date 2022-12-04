import * as React from 'react'
import { lazy, memo, Suspense } from 'react'
import tw from 'twin.macro'
const CodeBlock = lazy(() => import('./code-block'))

export default memo(function CodeBlockWrapper(props: {
  children: React.ReactNode & {
    props: {
      className: string
      children: string
      meta?: string
    }
  }
  isFromPackageImport: boolean
  noMargin?: boolean
  noMarkers?: boolean
}): any {
  const { children, isFromPackageImport } = props
  return (
    <Suspense
      fallback={
        <pre
          css={[
            tw`rounded-lg leading-6 h-full w-full overflow-x-auto flex items-center bg-wash dark:bg-gray-95 shadow-lg text-[13.6px] overflow-hidden`,
            !isFromPackageImport && tw`my-8`,
          ]}
        >
          <div tw="py-[18px] pl-5 font-normal ">
            <p tw="overflow-hidden" className="sp-pre-placeholder">
              {children}
            </p>
          </div>
        </pre>
      }
    >
      <CodeBlock {...props} />
    </Suspense>
  )
})
