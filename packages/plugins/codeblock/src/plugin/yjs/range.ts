import * as Y from 'yjs'

export interface YRange {
  yanchor: Y.RelativePosition
  yhead: Y.RelativePosition
  toJSON(): Record<'yanchor' | 'yhead', any>
}

export const YRange = {
  fromJSON(json: any) {
    return createYRange(
      Y.createRelativePositionFromJSON(json.yanchor),
      Y.createRelativePositionFromJSON(json.yhead),
    )
  },
}

export const createYRange = (yanchor: Y.RelativePosition, yhead: Y.RelativePosition) => {
  return {
    yanchor,
    yhead,
    toJSON() {
      return {
        yanchor: Y.relativePositionToJSON(this.yanchor),
        yhead: Y.relativePositionToJSON(this.yhead),
      }
    },
  }
}
