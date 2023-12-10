import { nothing, render } from "lit-html"
import { virtual } from "./virtual"

export interface CreatePortal {
  container: HTMLElement | DocumentFragment
  children: unknown
}

const createPortal = virtual<CreatePortal>(function (props) {
  const { container, children } = props
  const rootPart = render(children, container)
  // @ts-ignore
  rootPart._$parent = this
  return nothing
})

export { createPortal }
