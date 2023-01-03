import { Editable, Editor, Path, Transforms } from '@editablejs/editor'
import { IMAGE_KEY } from './constants'
import { Image } from './interfaces/image'
import { getOptions } from './options'

export const readBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = error => {
      reject(error)
    }
  })
}

export const readImageInfo = (url: string) => {
  return new Promise<Record<'width' | 'height', number>>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height,
      })
    }
    image.onerror = () => {
      reject('读取图片识别')
    }
    image.src = url
  })
}

interface ReadImageFileInfo {
  url: string
  file: File
  width: number
  height: number
}

export const readImageFileInfo = (file: File) => {
  return new Promise<ReadImageFileInfo | null>(resolve => {
    const url = URL.createObjectURL(file)
    readImageInfo(url)
      .then(info => {
        resolve({
          ...info,
          url,
          file,
        })
      })
      .catch(() => {
        resolve(null)
      })
  })
}

export const defaultUpload = (file: File | string) => {
  return new Promise<string>((resolve, reject) => {
    if (file instanceof File) {
      readBase64(file).then(resolve).catch(reject)
    } else {
      resolve(file)
    }
  })
}

export const setPercentage = (editor: Editable, path: Path, percentage: number) => {
  Transforms.setNodes<Image>(editor, { percentage }, { at: path })
}

export const insertImage = (editor: Editable, options: Partial<Image>) => {
  const image: Image = {
    type: IMAGE_KEY,
    ...options,
    children: [{ text: '' }],
  }

  Transforms.insertNodes(editor, image)
  const entry = Editor.above(editor, {
    match: n => Image.isImage(n),
  })
  if (!entry) throw new Error('image not found')
  return entry[1]
}

export const uploadImage = (editor: Editable, path: Path, file: File | string) => {
  const options = getOptions(editor)
  const promise = new Promise<void>(resolve => {
    const pathRef = Editor.pathRef(editor, path)

    const { onUpload = defaultUpload } = options
    onUpload(file, ({ percentage }) => {
      const path = pathRef.current
      if (path) setPercentage(editor, path, percentage)
    })
      .then(url => {
        const path = pathRef.current
        if (path) Transforms.setNodes<Image>(editor, { url, state: 'done' }, { at: path })
      })
      .catch(err => {
        const path = pathRef.current
        if (path)
          Transforms.setNodes<Image>(
            editor,
            { state: 'error', errorMessage: err.message },
            { at: path },
          )
      })
      .finally(() => {
        const path = pathRef.unref()

        if (path) setPercentage(editor, path, 100)

        resolve()
      })
  })
  return promise
}
