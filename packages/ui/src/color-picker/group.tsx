import { FC } from 'react'
import { ColorPickerItem } from './item'
import { Palette } from './palette'
import tw, { css } from 'twin.macro'

export interface ColorPickerGroupProps {
  palette: Palette
  colors: string[]
  activeColors: string[]
  onSelect?: (color: string, event: React.MouseEvent) => void
}

export const ColorPickerGroup: FC<ColorPickerGroupProps> = ({ colors, ...props }) => {
  return (
    <span
      css={[
        tw`flex w-full h-auto relative`,
        css`
          :nth-child(1) {
            ${tw`mb-1.5`}
          }

          :last-child {
            margin-bottom: 0px;
          }
        `,
      ]}
    >
      {colors.map(color => {
        return <ColorPickerItem color={color} key={color} {...props} />
      })}
    </span>
  )
}
