import { Editable } from '@editablejs/editor'
import { Image } from './interfaces/image'
import { getViewer } from './create-viewer'

export const Viewer = {
  images: (editor: Editable, force = false) => {
    const viewer = getViewer(editor)
    return viewer.images(force)
  },

  open: (editor: Editable, image: Image) => {
    const viewer = getViewer(editor)
    viewer.open(image)
  },

  close: (editor: Editable) => {
    const viewer = getViewer(editor)
    viewer.close()
  },

  prev: (editor: Editable) => {
    const viewer = getViewer(editor)
    viewer.prev()
  },

  next: (editor: Editable) => {
    const viewer = getViewer(editor)
    viewer.next()
  },
}
