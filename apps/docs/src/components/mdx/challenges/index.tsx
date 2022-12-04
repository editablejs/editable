import * as React from 'react'
export { Challenges } from './challenges'

export function Hint({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function Solution({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
