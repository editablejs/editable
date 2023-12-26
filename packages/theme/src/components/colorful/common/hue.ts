

import { Interactive, Interaction } from "./interactive";
import { Pointer } from "./pointer";

import { hsvaToHslString } from "../utils/convert";
import { clamp } from "../utils/clamp";
import { round } from "../utils/round";
import { html, c } from "rezon";
import { cx } from "@emotion/css";
import { alphaClassName } from "../styles";
import { css } from "twin.macro";

interface Props {
  className?: string;
  hue: number;
  onChange: (newHue: { h: number }) => void;
}

export const Hue = c<Props>(({ className, hue, onChange }) => {
  const handleMove = (interaction: Interaction) => {
    onChange({ h: 360 * interaction.left });
  };

  const handleKey = (offset: Interaction) => {
    // Hue measured in degrees of the color circle ranging from 0 to 360
    onChange({
      h: clamp(hue + offset.left * 360, 0, 360),
    });
  };

  return html`<div class=${cx(alphaClassName, className)}>
  ${Interactive({
    onMove: handleMove,
    onKey: handleKey,
    "aria-label": "Hue",
    "aria-valuenow": round(hue),
    "aria-valuemax": 360,
    "aria-valuemin": 0,
    children: Pointer({
      className: css`z-index: 2`,
      left: hue / 360,
      color: hsvaToHslString({ h: hue, s: 100, v: 100, a: 1 }),
    }),
  })
    }
  </div>`
}, true)

