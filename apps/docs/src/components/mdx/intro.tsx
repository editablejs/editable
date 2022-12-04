import * as React from 'react'

export interface IntroProps {
  children?: React.ReactNode
}

function Intro({ children }: IntroProps) {
  return <div tw="text-xl text-primary dark:text-primary-dark leading-relaxed">{children}</div>
}

export default Intro
