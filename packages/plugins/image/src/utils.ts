import { Editor, Path, Transforms } from '@editablejs/models'
import { IMAGE_KEY } from './constants'
import { Image } from './interfaces/image'
import { getOptions } from './options'

const readBase64WithFileReader = (file: File) => {
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

const readBase64WithFetch = (url: string) => {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = () => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = error => {
        reject(error)
      }
      reader.readAsDataURL(xhr.response)
    }
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
  })
}

export const readBase64 = (file: File | string) => {
  return typeof file === 'string' ? readBase64WithFetch(file) : readBase64WithFileReader(file)
}

export const readImageElement = (url: string, base64 = false) => {
  return new Promise<HTMLImageElement>(async (resolve, reject) => {
    if (base64) url = await readBase64(url)
    const image = new window.Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = () => {
      reject('image load error')
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
    readImageElement(url)
      .then(image => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
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

export const setPercentage = (editor: Editor, path: Path, percentage: number) => {
  Transforms.setNodes<Image>(editor, { percentage }, { at: path })
}

export const insertImage = (editor: Editor, options: Partial<Image>) => {
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

export const uploadImage = (editor: Editor, path: Path, file: File | string) => {
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
            { state: 'error', errorMessage: typeof err === 'string' ? err : err.message },
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

export function rotateImgWithCanvas(image: HTMLImageElement, degrees: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx || !image.height || !image.width) return
    const horizontal = [-270, -90, 90, 270]
    if (horizontal.includes(degrees)) {
      canvas.width = image.naturalHeight || 0
      canvas.height = image.naturalWidth || 0
    } else {
      canvas.width = image.naturalWidth || 0
      canvas.height = image.naturalHeight || 0
    }
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((degrees * Math.PI) / 180)
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)
    canvas.toBlob(blob => {
      blob ? resolve(blob) : reject('blob is null')
    }, 'image/jpeg')
  })
}
