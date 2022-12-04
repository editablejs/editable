import * as React from 'react'
import { H3 } from './heading'

interface SimpleCalloutProps {
  title: string
  children: React.ReactNode
  className?: string
}
function SimpleCallout({ title, children, className }: SimpleCalloutProps) {
  return (
    <div
      tw="bg-card dark:bg-card-dark text-secondary dark:text-secondary-dark my-8 rounded-lg p-6 pb-4 text-base shadow-inner xl:p-8 xl:pb-6"
      className={className}
    >
      <H3 tw="text-primary dark:text-primary-dark mt-0 mb-3 leading-tight" isPageAnchor={false}>
        {title}
      </H3>
      {children}
    </div>
  )
}

export default SimpleCallout
