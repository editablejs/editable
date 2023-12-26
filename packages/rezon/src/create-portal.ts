import { nothing, render } from './lit-html/html'
import { useMemo } from './use-memo'
import { c } from './component'

export interface CreatePortal {
  container: HTMLElement | DocumentFragment
  children: unknown
}

const createPortal = c<CreatePortal>(function (props) {
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
