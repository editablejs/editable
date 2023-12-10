import { Interactive, Interaction } from "./interactive";
import { Pointer } from "./pointer";
import { HsvaColor } from "../types";
import { hsvaToHslString } from "../utils/convert";
import { clamp } from "../utils/clamp";
import { round } from "../utils/round";
import { html, virtual } from "rezon";
import { cx } from "@emotion/css";
import { saturationClassName, insetBoxShadowClassName } from "../styles";
import { css } from "twin.macro";

interface Props {
  hsva: HsvaColor;
  onChange: (newColor: { s: number; v: number }) => void;
}

export const Saturation = virtual<Props>(({ hsva, onChange }) => {
  const handleMove = (interaction: Interaction) => {
    onChange({
      s: interaction.left * 100,
      v: 100 - interaction.top * 100,
    });
  };

  const handleKey = (offset: Interaction) => {
    // Saturation and brightness always fit into [0, 100] range
    onChange({
      s: clamp(hsva.s + offset.left * 100, 0, 100),
      v: clamp(hsva.v - offset.top * 100, 0, 100),
    });
  };

  const containerStyle = {
    backgroundColor: hsvaToHslString({ h: hsva.h, s: 100, v: 100, a: 1 }),
  };

  return html`<div class=${cx(saturationClassName, insetBoxShadowClassName)}>
  ${
    Interactive({
      onMove: handleMove,
      onKey: handleKey,
      "aria-label": "Color",
      "aria-valuetext": `Saturation ${round(hsva.s)}%, Brightness ${round(hsva.v)}%`,
      children: Pointer({
        className: css`z-index: 3;`,
        top: 1 - hsva.v / 100,
        left: hsva.s / 100,
        color: hsvaToHslString(hsva),
      }),
    })
  }
  </div>`
}, true);
