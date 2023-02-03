import { Icon } from '@editablejs/ui'
import tw, { css, styled, theme } from 'twin.macro'

export const TableStyles = styled.div(
  ({
    isHover,
    isSelected,
    isDragging,
  }: {
    isHover: boolean
    isSelected: boolean
    isDragging: boolean
  }) => [
    tw`relative`,
    css`
      --table-padding-top: 14px;
      --table-border-color: #d6d6d6;
      --table-split-bg: ${theme('colors.primary')};
      --table-item-bg: #f2f3f5;
      --table-item-hover-bg: #e2e4e6;
      --table-item-wh: 8px;
      padding: var(--table-padding-top) 0 10px;
      > table {
        ${tw`w-full table-fixed border-collapse whitespace-pre-wrap`}

        tr,
        td {
          ${tw`m-0 p-0`};
        }
      }
    `,
    isDragging && tw`cursor-default`,
    (isHover || isSelected) &&
      css`
        ${ColsHeaderStyles} {
          display: flex;
        }
      `,
    (isHover || isSelected) &&
      css`
        ${AllHeaderStyles},${RowsHeaderStyles} {
          display: flex;
        }
      `,
  ],
)

export const CellStyles = styled.td(() => [
  css`
    border: 1px solid var(--table-border-color);
    vertical-align: top;
  `,
])

export const CellInnerStyles = styled.div(() => [
  css`
    padding: 6px;
  `,
])

export const RowStyles = styled.tr(() => [])

export const SelectionStyles = styled.div`
  background-color: rgba(0, 106, 254, 0.12);
  position: absolute;
  background-color: rgba(0, 106, 254, 0.12);
  pointer-events: none;
  cursor: default;
`

export const ColsHeaderStyles = styled.div(() => [
  css`
    position: absolute;
    left: 0;
    top: calc(var(--table-item-wh) - 2px);
    display: none;
    border-left: none;
  `,
])

export const HeaderDragStyles = styled(Icon)`
  position: absolute;
  font-size: 8px;
  color: #fff;
  display: none;
`

export const ColsHeaderItemStyles = styled.div(
  ({ isHover, isFull, allFull }: { isHover: boolean; isFull: boolean; allFull: boolean }) => [
    css`
      height: var(--table-item-wh);
      background: var(--table-item-bg);
      cursor: pointer;
      border-bottom: 1px solid var(--table-border-color);
      position: absolute;

      &:hover {
        background: var(--table-item-hover-bg);
        z-index: 2;
      }
    `,
    isHover &&
      css`
        background: var(--table-item-hover-bg);
        z-index: 2;
      `,
    isFull &&
      css`
        background: var(--table-split-bg);
        z-index: 3;

        &:hover {
          background: var(--table-split-bg);
        }
      `,
    isFull &&
      !allFull &&
      css`
        cursor: move;
      `,
    isFull &&
      !allFull &&
      `${HeaderDragStyles} {
      display: flex;
      left: calc(50% - 8px);
      transform: rotate(90deg);
    }`,
  ],
)

export const RowsHeaderStyles = styled.div(() => [
  css`
    display: none;
    position: absolute;
    top: var(--table-padding-top);
    left: calc(0px - var(--table-item-wh));
  `,
])

export const RowsHeaderItemStyles = styled.div(
  ({ isHover, isFull, allFull }: { isHover: boolean; isFull: boolean; allFull: boolean }) => [
    css`
      width: var(--table-item-wh);
      background: var(--table-item-bg);
      cursor: pointer;
      border-right: 1px solid var(--table-border-color);
      position: absolute;

      &:hover {
        background: var(--table-item-hover-bg);
        z-index: 2;
      }
    `,
    isHover &&
      css`
        background: var(--table-item-hover-bg);
        z-index: 2;
      `,
    isFull &&
      css`
        background: var(--table-split-bg);
        z-index: 3;

        &:hover {
          background: var(--table-split-bg);
        }
      `,

    isFull &&
      !allFull &&
      css`
        cursor: move;
      `,
    isFull &&
      !allFull &&
      `${HeaderDragStyles} {
      display: flex;
      top: calc(50% - 4px);
    }`,
  ],
)

export const AllHeaderStyles = styled.div(({ allFull }: { allFull: boolean }) => [
  css`
    position: absolute;
    top: calc(var(--table-item-wh) - 2px);
    left: calc(0px - var(--table-item-wh));
    width: var(--table-item-wh);
    height: var(--table-item-wh);
    cursor: pointer;
    border-right: 1px solid var(--table-border-color);
    border-bottom: 1px solid var(--table-border-color);
    background: var(--table-item-bg);
    border-top-left-radius: 2px;
    display: none;
    &:hover {
      background: var(--table-item-hover-bg);
    }
  `,
  allFull &&
    css`
      background-color: var(--table-split-bg);
      border-color: var(--table-split-bg);
      border: none;

      &:hover {
        background-color: var(--table-split-bg);
      }
    `,
])

export const ColsInsertStyles = styled.div(({ isActive }: { isActive?: boolean }) => [
  css`
    position: absolute;
    top: calc(0px - var(--table-item-wh) + 2px);
    line-height: 0;
    cursor: pointer;
    z-index: ${isActive ? 3 : 'unset'};
    &:hover {
      z-index: 3;

      ${ColsInsertPlusStyles},${ColsInsertLineStyles} {
        display: flex;
      }
    }
  `,
  isActive && tw`pointer-events-none`,
])

export const ColsInsertPlusStyles = styled.div(() => [
  css`
    color: var(--table-split-bg);
    display: none;
    font-size: 18px;
    position: absolute;
    top: -13px;
    left: -7.5px;
    align-items: flex-end;
    justify-content: center;
  `,
])

export const ColsInsertLineStyles = styled(ColsInsertPlusStyles)`
  top: 3px;
  left: 0.5px;
  width: 2px;
  background-color: var(--table-split-bg);
  ${({ isActive }: { isActive?: boolean }) =>
    isActive ? 'display: flex; z-index: 3; pointer-events: none;' : ''}
`

export const ColsInsertIconStyles = styled.div(() => [
  css`
    display: flex;
    width: 6px;
    height: 6px;
    position: absolute;
    top: 0;
    left: -1.5px;
    justify-content: center;
  `,
])

export const RowsInsertStyles = styled.div(({ isActive }: { isActive?: boolean }) => [
  css`
    position: absolute;
    left: calc(0px - var(--table-item-wh) + 2px);
    line-height: 0;
    cursor: pointer;
    z-index: ${isActive ? 3 : 'unset'};

    &:hover {
      z-index: 3;

      ${RowsInsertPlusStyles},${RowsInsertLineStyles} {
        display: flex;
      }
    }
  `,
])

export const RowsInsertIconStyles = styled.div(() => [
  css`
    display: flex;
    width: 6px;
    height: 6px;
    position: absolute;
    top: 0;
    left: 0;
    justify-content: flex-start;
  `,
])

export const RowsInsertPlusStyles = styled.div(() => [
  css`
    color: var(--table-split-bg);
    display: none;
    font-size: 18px;
    position: absolute;
    top: -7.5px;
    left: -13px;
    align-items: flex-end;
    justify-content: flex-start;
  `,
])

export const RowsInsertLineStyles = styled(ColsInsertPlusStyles)`
  top: 0.5px;
  left: 3px;
  height: 2px;
  background-color: var(--table-split-bg);
  ${({ isActive }: { isActive?: boolean }) =>
    isActive ? 'display: flex; z-index: 3; pointer-events: none;' : ''}
`

export const ColsSplitStyles = styled.div(({ isHover }: { isHover: boolean }) => [
  css`
    position: absolute;
    top: 0;
    height: var(--table-item-wh) + 2px;
    padding: 0 1px;
    z-index: 1;
  `,
  isHover && tw`z-[3] cursor-col-resize`,
])

export const ColsSplitLineStyles = styled.div(({ isHover }: { isHover: boolean }) => [
  css`
    background-color: transparent;
    width: 1px;
    height: 100%;
  `,
  isHover &&
    css`
      background-color: var(--table-split-bg);
    `,
])

export const RowsSplitStyles = styled.div(({ isHover }: { isHover: boolean }) => [
  css`
    position: absolute;
    left: 0;
    width: calc(var(--table-item-bg) + 2px);
    padding: 1px 0;
    z-index: 1;
  `,
  isHover && tw`z-[3] cursor-row-resize`,
])

export const RowsSplitLineStyles = styled.div(({ isHover }: { isHover: boolean }) => [
  css`
    background-color: transparent;
    width: 100%;
    height: 1px;
  `,
  isHover &&
    css`
      background-color: var(--table-split-bg);
    `,
])
