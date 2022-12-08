import * as React from 'react'
import CodeBlock from './code-block'

interface PackageImportProps {
  children: React.ReactNode
}

export function PackageImport({ children }: PackageImportProps) {
  const terminal = React.Children.toArray(children).filter((child: any) => {
    return child.type?.mdxName !== 'pre'
  })
  const code = React.Children.toArray(children).map((child: any, i: number) => {
    if (child.type?.mdxName === 'pre') {
      return (
        <CodeBlock {...child.props} isFromPackageImport key={i} noMargin={true} noMarkers={true} />
      )
    } else {
      return null
    }
  })
  return (
    <section tw="my-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
      <div tw="flex flex-col justify-center">{terminal}</div>
      <div tw="flex flex-col justify-center">{code}</div>
    </section>
  )
}
