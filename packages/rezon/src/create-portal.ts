import { nothing, render } from './lit-html/html'
import { useMemo } from './use-memo'
import { c } from './component'
import { useLayoutEffect } from './use-layout-effect'

export interface CreatePortal {
  container: HTMLElement | DocumentFragment
  children: unknown
}

const createPortal = c<CreatePortal>(function (props) {
  const { container, children } = props
  this._$portal = true
  const root = useMemo(
    () => render(children, container, {
      ...this.currentOptions,
      parent: this,
    }),
    [children, container],
  )

  useLayoutEffect(() => {
    return () => {
      delete (container as any)['_$litPart$']
      delete root._$parent
      root.setConnected(false)
      root._$clear()
    }
  }, [root, container])

  return nothing
})

export { createPortal }
