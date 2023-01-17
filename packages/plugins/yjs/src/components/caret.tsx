import tw, { styled, css } from 'twin.macro'
import { CaretPosition, CursorData } from '../types'

interface CaretProps<T extends CursorData = CursorData> {
  position: CaretPosition
  data: T
}

const StyledCaretInfo = styled.div`
  ${tw`absolute top-0.5 -left-0.5 whitespace-nowrap rounded-full text-[0px] w-1.5 h-1.5 text-white transition-[width,height] duration-200 ease-in-out`}
`

const StyledCaret = styled.div(() => [
  tw`absolute w-0.5 z-10`,
  css`
    &:hover ${StyledCaretInfo} {
      ${tw`rounded text-xs leading-[18px] px-1 py-0 w-auto h-auto`}
    }
  `,
])

export function Caret({ position, data }: CaretProps) {
  const caretStyle: React.CSSProperties = {
    ...position,
    background: data.color,
  }

  const labelStyle: React.CSSProperties = {
    transform: 'translateY(-100%)',
    background: data.color,
  }

  return (
    <StyledCaret style={caretStyle}>
      <StyledCaretInfo style={labelStyle}>{data.name}</StyledCaretInfo>
    </StyledCaret>
  )
}
