import { nothing, render } from './lit-html/html'
import { useMemo } from './use-memo'
import { virtual } from './virtual'

export interface CreatePortal {
  container: HTMLElement | DocumentFragment
  children: unknown
}

const createPortal = virtual<CreatePortal>(function (props) {
  const { container, children } = props
  const rootPart = useMemo(
    () => render(children, container, this.currentOptions),
    [children, container],
  )
  // @ts-ignore
  rootPart._$parent = this
  return nothing
})

export { createPortal }
