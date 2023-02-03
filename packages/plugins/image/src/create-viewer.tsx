import { Editable } from '@editablejs/editor'
import { Editor } from '@editablejs/models'
import { DataType } from 'react-image-previewer'
import { DATA_IMAGE_KEY } from './constants'
import { Image } from './interfaces/image'
import { getViewerStore } from './store'

const IMAGES_CACHE_WEAKMAP = new WeakMap<Editor, DataType[]>()

const findImages = (editor: Editable, force = false) => {
  const caches = IMAGES_CACHE_WEAKMAP.get(editor)
  if (caches && !force) return caches
  const images: DataType[] = []
  const nodes = Editor.nodes(editor, {
    at: [],
    match: node => Image.isImage(node) && !!node.url,
  })

  for (const [node] of nodes) {
    const key = Editable.findKey(editor, node).id
    const el = Editable.toDOMNode(editor, node)
    const image = el.querySelector(`img[${DATA_IMAGE_KEY}="${key}"]`)
    if (!image) continue
    const src = image.getAttribute('src')
    if (!src) continue
    images.push({
      key,
      src,
    })
  }
  IMAGES_CACHE_WEAKMAP.set(editor, images)
  return images
}

export const VIEWER_CACHE_WEAKMAP = new WeakMap<Editor, ReturnType<typeof createViewer>>()

const createViewer = (editor: Editable) => {
  const viewer = {
    images: (force = false) => findImages(editor, force),

    count: () => {
      return viewer.images().length
    },

    open: (image: Image) => {
      const store = getViewerStore(editor)
      const images = viewer.images(true)
      const key = Editable.findKey(editor, image).id
      return store.setState({
        visible: true,
        index: images.findIndex(image => image.key === key),
      })
    },

    close: () => {
      const store = getViewerStore(editor)
      store.setState({
        visible: false,
        index: -1,
      })
    },

    prev: () => {
      const store = getViewerStore(editor)
      const count = viewer.count()
      const index = store.getState().index
      let val = index - 1
      if (val < 0) val = count - 1
      store.setState({
        index: val,
      })
    },

    next: () => {
      const store = getViewerStore(editor)
      const count = viewer.count()
      const index = store.getState().index
      let val = index + 1
      if (val === count) val = 0
      store.setState({
        index: val,
      })
    },
  }
  return viewer
}

export const getViewer = (editor: Editable) => {
  let viewer = VIEWER_CACHE_WEAKMAP.get(editor)
  if (viewer) {
    return viewer
  }
  viewer = createViewer(editor)
  VIEWER_CACHE_WEAKMAP.set(editor, viewer)
  return viewer
}
