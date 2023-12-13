import {
  CSSProperties,
  HTMLAttributes,
  Ref,
  html,
  useRef,
  useState,
  virtual,
  useImperativeHandle,
  createPortal,
} from 'rezon'
import { ref } from 'rezon/directives/ref'
import { styleMap } from 'rezon/directives/style-map'
import { spread } from 'rezon/directives/spread'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'

export interface ShadowRect {
  left: number
  top: number
  width: number
  height: number
  color?: string
  style?: CSSProperties
}

type ShadowBlockProps = {
  rect: ShadowRect
} & HTMLAttributes<HTMLDivElement>

export const ShadowBlock = virtual<ShadowBlockProps>(
  ({ children, rect, style, ref: _ref, ...props }) =>
    html`<div
      ref=${ref(_ref)}
      style=${styleMap({
        position: 'absolute',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        // 数值为单数的情况下，两组重合位置会有阴影
        // transform: `translateX(${rect.left || 0}px) translateY(${rect.top || 0}px)`,
        opacity: 1,
        backgroundColor: `${rect.color || 'transparent'}`,
        zIndex: 1,
        ...style,
      })}
      ${spread(props)}
    >
      ${children}
    </div>`,
  (prev, next) => {
    return (
      prev.rect.left === next.rect.left &&
      prev.rect.top === next.rect.top &&
      prev.rect.width === next.rect.width &&
      prev.rect.height === next.rect.height &&
      prev.rect.color === next.rect.color &&
      prev.children === next.children
    )
  },
)

interface ShadowContainerProps {
  ref?: Ref<ShadowRoot>
  children?: unknown
}

const ShadowContainer = virtual<ShadowContainerProps>(({ children, ref: refProp }) => {
  const [root, setRoot] = useState<ShadowRoot>()
  const containerRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current || containerRef.current.shadowRoot) return
    const root = containerRef.current.attachShadow({ mode: 'open' })
    setRoot(root)
  }, [])

  useImperativeHandle(refProp, () => root!, [root])

  return html`<div
    ref=${ref(containerRef)}
    style=${styleMap({ position: 'absolute', zIndex: 2, top: 0, left: 0 })}
  >
    ${root
      ? createPortal({
          container: root,
          children: html`<div style=${styleMap({ pointerEvents: 'none' })}>${children}</div>`,
        })
      : ''}
  </div>`
})

export default ShadowContainer
