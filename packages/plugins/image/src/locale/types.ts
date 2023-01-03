import { Locale } from '@editablejs/editor'

export interface ImageLocale extends Locale {
  image: {
    viewer: {
      arrowLeft: string
      arrowRight: string
      arrowLeftDisabled: string
      arrowRightDisabled: string
      close: string
      zoomIn: string
      zoomOut: string
      oneToOne: string
      rotateLeft: string
      rotateRight: string
      download: string
    }
    style: {
      title: string
      tooltip: string
      none: string
      stroke: string
      shadow: string
    }
  }
}
