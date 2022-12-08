import * as React from 'react'

export type TocItem = {
  url: string
  text: React.ReactNode
  depth: number
}
export type Toc = Array<TocItem>

export const TocContext = React.createContext<Toc>([])
