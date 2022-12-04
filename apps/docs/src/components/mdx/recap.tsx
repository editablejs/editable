import * as React from 'react'
import { H2 } from './heading'

interface RecapProps {
  children: React.ReactNode
}

function Recap({ children }: RecapProps) {
  return (
    <section>
      <H2 isPageAnchor id="recap">
        Recap
      </H2>
      {children}
    </section>
  )
}

export default Recap
