import * as React from 'react'
import CodeBlock from './code-block'

interface CodeDiagramProps {
  children: React.ReactNode
  flip?: boolean
}

export function CodeDiagram({ children, flip = false }: CodeDiagramProps) {
  const illustration = React.Children.toArray(children).filter((child: any) => {
    return child.type === 'img'
  })
  const content = React.Children.toArray(children).map((child: any) => {
    if (child.type?.mdxName === 'pre') {
      return <CodeBlock {...child.props} noMargin={true} noMarkers={true} />
    } else if (child.type === 'img') {
      return null
    } else {
      return child
    }
  })
  if (flip) {
    return (
      <section tw="my-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
        {illustration}
        <div tw="flex flex-col justify-center">{content}</div>
      </section>
    )
  }
  return (
    <section tw="my-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
      <div tw="flex flex-col justify-center">{content}</div>
      <div tw="py-4">{illustration}</div>
    </section>
  )
}
