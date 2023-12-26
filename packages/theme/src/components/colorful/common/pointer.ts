import { html, c } from "rezon";
import { css } from "twin.macro";
import { styleMap } from "rezon/directives/style-map";
import { fillWithGradientClassName, pointerClassName } from "../styles";

interface Props {
  className?: string;
  top?: number;
  left: number;
  color: string;
}

export const Pointer = c<Props>(({ className, color, left, top = 0.5 }) => {

  const style = {
    top: `${top * 100}%`,
    left: `${left * 100}%`,
  };

  return html`<div class=${css(pointerClassName, className)} style=${styleMap(style)}>
    <div class="${css(fillWithGradientClassName)}" style=${styleMap({ backgroundColor: color })} />
  </div>`;
  ;
});
