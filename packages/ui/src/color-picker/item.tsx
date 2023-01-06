import React from 'react'
import tinycolor2, { ColorInput } from 'tinycolor2'
import tw, { css } from 'twin.macro'
import { Palette } from './palette'

export type ColorPickerItemProps = {
  palette: Palette
  color: string
  activeColors: Array<string>
  setStroke?: boolean
  onSelect?: (color: string, event: React.MouseEvent) => void
}

export const ColorPickerItem: React.FC<ColorPickerItemProps> = ({
  palette,
  color,
  activeColors,
  setStroke,
  onSelect,
}) => {
  const toState = (
    color: ColorInput & { hex?: string; h?: string; source?: string },
    oldHue?: number,
  ) => {
    const tinyColor = color.hex ? tinycolor2(color.hex) : tinycolor2(color)
    const hsl = tinyColor.toHsl()
    const hsv = tinyColor.toHsv()
    const rgb = tinyColor.toRgb()
    const hex = tinyColor.toHex()

    if (hsl.s === 0) {
      hsl.h = oldHue || 0
      hsv.h = oldHue || 0
    }

    const transparent = hex === '000000' && rgb.a === 0
    return {
      hsl: hsl,
      hex: transparent ? 'transparent' : '#'.concat(hex),
      rgb: rgb,
      hsv: hsv,
      oldHue: color.h || oldHue || hsl.h,
      source: color.source,
    }
  }

  const getContrastingColor = (color: {
    hsl: tinycolor2.ColorFormats.HSLA
    hex: string
    rgb: tinycolor2.ColorFormats.RGBA
    hsv: tinycolor2.ColorFormats.HSVA
    oldHue: any
    source: any
  }) => {
    if (color.hex === 'transparent') {
      return 'rgba(0,0,0,0.4)'
    }

    const yiq = (color.rgb.r * 299 + color.rgb.g * 587 + color.rgb.b * 114) / 1000
    return yiq >= 210 ? '#8C8C8C' : '#FFFFFF'
  }

  const triggerSelect = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (onSelect) onSelect(color, event)
  }
  const state = toState(color || '#FFFFFF')
  //接近白色的颜色，需要添加一个边框。不然看不见
  const needBorder = ['#ffffff', '#fafafa', 'transparent'].indexOf(state.hex) >= 0
  //是否激活
  const active = activeColors.indexOf(color) >= 0
  const special = 'transparent' === color
  const styles: any = {
    check: {
      fill: getContrastingColor(state),
      display: active ? 'block' : 'none',
    },
    block: {
      backgroundColor: color,
    },
  }
  if (setStroke) {
    styles.block.border = `1px solid ${palette.getStroke(color)}`
  }
  return (
    <span
      css={[
        tw`w-6 h-6 p-0.5 inline-block rounded-[3px] border border-transparent cursor-pointer bg-transparent hover:border hover:bg-white hover:border-zinc-200 hover:shadow`,
        special && tw`relative`,
        special &&
          css`
            content: '';
            display: block;
            position: absolute;
            top: 10px;
            left: 0px;
            width: 22px;
            height: 0;
            border-bottom: 2px solid #ff5151;
            transform: rotate(45deg);
          `,
      ]}
      onClick={triggerSelect}
      title={palette.getTitle(color)}
    >
      <span
        css={[
          tw`relative w-[18px] h-[18px] block rounded-sm border border-transparent`,
          needBorder && tw`border border-zinc-200`,
        ]}
        style={styles.block}
      >
        <svg tw="absolute -top-[1px] left-[1px] w-3 h-3" style={styles.check} viewBox="0 0 18 18">
          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
        </svg>
      </span>
    </span>
  )
}
