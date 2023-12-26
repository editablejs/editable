import { SVGAttributes, html, svg, c } from "rezon"
import { ref } from "rezon/directives/ref"
import { spread } from "rezon/directives/spread"


export interface ArrowProps extends SVGAttributes<SVGSVGElement> { }

const defaultContent = svg`<polygon points="0,0 30,0 15,10" />`

export const Arrow = c<ArrowProps>((props) => {
  const { children, width = 10, height = 5, ref: refProps, ...arrowProps } = props
  return html`<svg
  ${spread(arrowProps)}
  ref=${ref(refProps)}
  width=${width}
  height=${height}
  viewBox="0 0 30 10"
  preserveAspectRatio="none"
  >
  ${children || defaultContent}
  </svg>
  `
})
