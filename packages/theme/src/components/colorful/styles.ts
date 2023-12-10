import { css } from "twin.macro";

export const fillWithGradientClassName = css`
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: inherit;
`

export const insetBoxShadowClassName = css`
 box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
 `
export const pointerClassName = css`
position: absolute;
  z-index: 1;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

export const interactiveClasName = css`
position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  outline: none;
  touch-action: none;

  &:focus, ${pointerClassName} {
    transform: translate(-50%, -50%) scale(1.1);
  }
`

export const alphaClassName = css`
  position: relative;
  height: 24px;
  `
export const alphaPointerClassName = css`
   background-color: #fff;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><rect x="8" width="8" height="8"/><rect y="8" width="8" height="8"/></svg>');
`

export const saturationClassName = css`
position: relative;
  flex-grow: 1;
  border-color: transparent; /* Fixes https://github.com/omgovich/react-colorful/issues/139 */
  border-bottom: 12px solid #000;
  border-radius: 8px 8px 0 0;
  background-image: linear-gradient(to top, #000, rgba(0, 0, 0, 0)),
    linear-gradient(to right, #fff, rgba(255, 255, 255, 0));`

export const colorfulClassName = `
position: relative;
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 200px;
  user-select: none;
  cursor: default;`

export const colorfulLastControlClassName = css`
border-radius: 0 0 8px 8px;`
