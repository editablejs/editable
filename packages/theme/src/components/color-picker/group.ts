
import { html, virtual } from 'rezon'
import { ColorPickerItem } from './item'
import { Palette } from './palette'
import tw, { css } from 'twin.macro'
import { repeat } from 'rezon/directives/repeat'

export interface ColorPickerGroupProps {
  palette: Palette
  colors: string[]
  activeColors: string[]
  onSelect?: (color: string, event: MouseEvent) => void
}

export const ColorPickerGroup = virtual<ColorPickerGroupProps>(({ colors, ...props }) => {
  return html`<span class="${css([
        tw`flex w-full h-auto relative`,
        css`
          :nth-child(1) {
            ${tw`mb-1.5`}
          }

          :last-child {
            margin-bottom: 0px;
          }
        `,
  ])}">
  ${repeat(colors, color => color, (color) => ColorPickerItem({ color, ...props }))}
  </span>`
})
