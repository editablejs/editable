import { ReactNode } from 'react'

interface DiagramGroupProps {
  children: ReactNode
}

export function DiagramGroup({ children }: DiagramGroupProps) {
  return (
    <div tw="flex flex-col sm:flex-row py-2 sm:p-0 sm:space-y-0 justify-center items-start sm:items-center w-full">
      {children}
    </div>
  )
}

export default DiagramGroup
