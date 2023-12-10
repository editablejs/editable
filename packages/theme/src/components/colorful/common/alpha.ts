

import { Interactive, Interaction } from "./interactive";
import { Pointer } from "./pointer";

import { hsvaToHslaString } from "../utils/convert";
import { clamp } from "../utils/clamp";
import { round } from "../utils/round";
import { HsvaColor } from "../types";
import { cx } from "@emotion/css";
import { html } from "rezon";
import { styleMap } from "rezon/directives/style-map";
import { alphaClassName, fillWithGradientClassName, insetBoxShadowClassName, alphaPointerClassName } from "../styles";

interface Props {
  className?: string;
  hsva: HsvaColor;
  onChange: (newAlpha: { a: number }) => void;
}

export const Alpha = ({ className, hsva, onChange }: Props) => {
  const handleMove = (interaction: Interaction) => {
    onChange({ a: interaction.left });
  };

  const handleKey = (offset: Interaction) => {
    // Alpha always fit into [0, 1] range
    onChange({ a: clamp(hsva.a + offset.left) });
  };

  // We use `Object.assign` instead of the spread operator
  // to prevent adding the polyfill (about 150 bytes gzipped)
  const colorFrom = hsvaToHslaString(Object.assign({}, hsva, { a: 0 }));
  const colorTo = hsvaToHslaString(Object.assign({}, hsva, { a: 1 }));

  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
  };

  const ariaValue = round(hsva.a * 100);

  return html`<div class="${cx(alphaClassName, className)}">
  <div class=${cx(fillWithGradientClassName, insetBoxShadowClassName)} style=${styleMap(gradientStyle)}></div>
  ${Interactive({
    onMove: handleMove,
    onKey: handleKey,
    "aria-label": "Alpha",
    "aria-valuetext": `${ariaValue}%`,
    "aria-valuenow": ariaValue,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    children: Pointer({
      className: alphaPointerClassName,
      left: hsva.a,
      color: hsvaToHslaString(hsva),
    }),
  })
    }
  </div>`;
};
