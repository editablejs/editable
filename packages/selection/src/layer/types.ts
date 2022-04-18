export interface Position {
  left: number
  top: number
  width: number
  height: number
  color?: string
}

export interface ILayerContainer {

  getShadow(): HTMLElement

  setCaret(position: Position): void
  
  setLines(...position: Position[]): void

  clear(): void
}

export interface ISelectionLayer {

}