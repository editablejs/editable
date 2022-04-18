import type { IRange, ISelectionLayer } from "../types";
import { ILayerContainer } from "./types";
import LayerContainer from "./container";

export default class SelectionLayer implements ISelectionLayer {

  private layerContainer: ILayerContainer = new LayerContainer();

  constructor(container: HTMLElement) {
    document.body.appendChild(this.layerContainer.getShadow())
  }

  draw = (...ranges: IRange[]) => {
    ranges.forEach(this.drawRange)
  }

  drawRange = (range: IRange) => { 
    const rects = range.getClientRects()
    if(!rects) return
    if(range.isCollapsed) {
      this.layerContainer.setCaret({...rects[0].toJSON(), width: 2, color: '#000'})
    } else {
      console.log(rects, range)
      this.layerContainer.setLines(...Array.from(rects).map(rect => ({ ...rect.toJSON() })))
    }
  }
}