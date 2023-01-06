import { Editable, Hotkey, Transforms, Locale, Editor, Operation, Slot } from '@editablejs/editor'
import { openFileDialog } from '@editablejs/ui'
import { setOptions, ImageHotkey, ImageOptions } from './options'
import { Image } from './interfaces/image'
import { ImageComponent } from './components/image'
import { ImageEditor } from './editor'
import locale, { ImageLocale } from './locale'
import { insertImage, readImageFileInfo, uploadImage } from './utils'
import { ImageViewer } from './components/viewer'

const defaultHotkey: ImageHotkey = ''

const defaultBeforeUpload = (files: File[]) => {
  return files.filter(file => file.type.startsWith('image/'))
}

export const withImage = <T extends Editable>(editor: T, options: ImageOptions = {}) => {
  const newEditor = editor as T & ImageEditor & { captureHistory?: (op: Operation) => boolean }

  setOptions(newEditor, options)

  const { isInline, isVoid, captureHistory } = newEditor

  if (captureHistory) {
    newEditor.captureHistory = (op: Operation) => {
      if (op.type === 'set_node') {
        const { path, newProperties } = op
        const image = Editor.node(editor, path)
        if (Image.isImage(image[0])) {
          const prop = newProperties as Partial<Image>
          if (prop.url || prop.state || prop.percentage) {
            return false
          }
        }
      }
      return captureHistory(op)
    }
  }

  const { locale: localeOptions = {} } = options
  Locale.setLocale(newEditor, locale, localeOptions)

  Slot.mount(newEditor, ImageViewer)

  newEditor.isInline = element => {
    return ImageEditor.isImage(newEditor, element) || isInline(element)
  }

  newEditor.isVoid = element => {
    return ImageEditor.isImage(newEditor, element) || isVoid(element)
  }

  const insertImages = (files: (File | string)[]) => {
    Promise.all(
      files.map(file =>
        typeof file === 'string' ? Promise.resolve(file) : readImageFileInfo(file),
      ),
    ).then(items => {
      items.forEach(item => {
        if (!item) return
        if (typeof item === 'string') return newEditor.insertImage({ file: item })
        const { url, file, width, height } = item
        const path = insertImage(newEditor, {
          url,
          width,
          height,
          state: 'uploading',
        })
        uploadImage(editor, path, file).then(() => {
          URL.revokeObjectURL(url)
        })
      })
    })
  }
  const { onUploadBefore = defaultBeforeUpload } = options

  newEditor.openImage = ({ accept = 'image/*', multiple = false } = {}) => {
    if (!newEditor.selection) {
      newEditor.focus(false)
    }

    openFileDialog({
      accept,
      multiple,
      onChange: files => {
        const customFiles = onUploadBefore(files)
        if (customFiles.length > 0) insertImages(files)
      },
    })
  }

  newEditor.insertImage = async ({ file }) => {
    if (!newEditor.selection) {
      newEditor.focus(false)
    }

    const url = file instanceof File ? URL.createObjectURL(file) : file
    editor.normalizeSelection(selection => {
      if (editor.selection !== selection) editor.selection = selection
      const path = insertImage(editor, {
        url,
        state: 'uploading',
      })

      return uploadImage(editor, path, file)
    })
  }

  newEditor.rotateImage = (rotate, image) => {
    Transforms.setNodes<Image>(
      editor,
      {
        rotate,
      },
      {
        at: Editable.findPath(editor, image),
      },
    )
  }

  newEditor.setStyleImage = (style, image) => {
    Transforms.setNodes<Image>(
      editor,
      {
        style,
      },
      {
        at: Editable.findPath(editor, image),
      },
    )
  }

  const { renderElement } = newEditor
  newEditor.renderElement = ({ element, attributes, children }) => {
    if (ImageEditor.isImage(editor, element)) {
      return (
        <ImageComponent {...attributes} element={element} editor={newEditor}>
          {children}
        </ImageComponent>
      )
    }
    return renderElement({ attributes, children, element })
  }

  const hotkey = options.hotkey ?? defaultHotkey
  const { onKeydown, insertFile } = newEditor
  newEditor.onKeydown = (e: KeyboardEvent) => {
    const toggle = () => {
      e.preventDefault()
      newEditor.openImage()
    }
    if (
      (typeof hotkey === 'string' && hotkey && Hotkey.is(hotkey, e)) ||
      (typeof hotkey === 'function' && hotkey(e))
    ) {
      toggle()
      return
    }
    onKeydown(e)
  }

  newEditor.insertFile = (file, at) => {
    const customFiles = onUploadBefore([file])
    if (customFiles.length > 0) {
      if (at) {
        Transforms.select(newEditor, at)
      }
      insertImages(customFiles)
      return
    }
    insertFile(file, at)
  }
  return newEditor
}

export type { ImageOptions, ImageLocale }

export * from './interfaces/image'

export * from './editor'
