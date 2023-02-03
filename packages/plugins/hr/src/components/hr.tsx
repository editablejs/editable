import { RenderElementProps, useNodeFocused } from '@editablejs/editor'
import { FC } from 'react'
import tw, { css } from 'twin.macro'
import { HrEditor } from '../plugin/hr-editor'
import { Hr } from '../interfaces/hr'
import { HrPopover } from './hr-popover'

export interface HrProps extends RenderElementProps<Hr> {
  editor: HrEditor
  element: Hr
}

export const HrComponent: FC<HrProps> = ({ children, attributes, editor, element }) => {
  const focused = useNodeFocused()

  const { color, width, style } = element
  return (
    <HrPopover editor={editor} element={element}>
      <div
        css={[tw`py-4 rounded cursor-default hover:bg-gray-100`, focused && tw`bg-gray-100`]}
        {...attributes}
      >
        <hr
          css={[
            css`
              border-top: ${width}px ${style} ${color};
            `,
          ]}
        />

        <div tw="hidden absolute">{children}</div>
      </div>
    </HrPopover>
  )
}
