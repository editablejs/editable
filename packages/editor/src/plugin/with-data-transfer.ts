import { HTMLDeserializer } from '@editablejs/deserializer/html'
import { Editor, Transforms, Range, Node } from '@editablejs/models'
import { HTMLSerializer } from '@editablejs/serializer/html'
import { TextSerializer } from '@editablejs/serializer/text'
import { readClipboardData, writeClipboardData } from '../utils/clipboard'
import {
  APPLICATION_FRAGMENT_TYPE,
  DATA_EDITABLE_FRAGMENT,
  TEXT_HTML,
  TEXT_PLAIN,
} from '../utils/constants'
import { fragmentToString, parseDataTransfer } from '../utils/data-transfer'
import { IS_PASTE_TEXT } from '../utils/weak-maps'
import { Editable } from './editable'

export const withDataTransfer = <T extends Editor>(editor: T) => {
  const e = editor as T & Editable

  e.toDataTransfer = range => {
    const fragment = e.getFragment(range)
    const fragmentString = fragmentToString(fragment)

    const text = fragment.map(node => TextSerializer.transformWithEditor(e, node)).join('\n')

    let html = fragment.map(node => HTMLSerializer.transformWithEditor(e, node)).join('')
    html = `<div ${DATA_EDITABLE_FRAGMENT}="${fragmentString}">${html}</div>`
    html = `<html><head><meta name="source" content="${DATA_EDITABLE_FRAGMENT}" /></head><body>${html}</body></html>`
    const dataTransfer = new DataTransfer()
    dataTransfer.setData(TEXT_PLAIN, text)
    dataTransfer.setData(TEXT_HTML, html)
    dataTransfer.setData(APPLICATION_FRAGMENT_TYPE, fragmentString)
    return dataTransfer
  }

  e.onCut = event => {
    if (event.defaultPrevented) return
    const { selection } = e
    const { clipboardData } = event
    if (clipboardData) writeClipboardData(clipboardData)
    if (selection) {
      if (Range.isExpanded(selection)) {
        Editor.deleteFragment(e)
      } else {
        const node = Node.parent(e, selection.anchor.path)
        if (Editor.isVoid(e, node)) {
          Transforms.delete(e)
        }
      }
    }
    e.emit('cut', event)
  }

  e.onCopy = event => {
    if (event.defaultPrevented) return
    const { clipboardData } = event
    if (clipboardData) writeClipboardData(clipboardData)
    e.emit('copy', event)
  }

  e.onPaste = event => {
    if (event.defaultPrevented) return
    const { clipboardData } = event
    if (!clipboardData) return
    event.preventDefault()
    const { text, fragment, html, files } = parseDataTransfer(clipboardData)
    const isPasteText = event.type === 'pasteText'
    if (!isPasteText && fragment.length > 0) {
      e.insertFragment(fragment)
    } else if (!isPasteText && html) {
      const document = new DOMParser().parseFromString(html, TEXT_HTML)
      const fragment = HTMLDeserializer.transformWithEditor(e, document.body)
      e.insertFragment(fragment)
    } else {
      const lines = text.split(/\r\n|\r|\n/)
      let split = false

      for (const line of lines) {
        if (split) {
          Transforms.splitNodes(e, { always: true })
        }
        e.normalizeSelection(selection => {
          if (selection !== e.selection) e.selection = selection
          e.insertText(line)
        })
        split = true
      }
    }
    for (const file of files) {
      e.insertFile(file)
    }
    e.emit('paste', event)
  }

  e.copy = range => {
    const data = e.toDataTransfer(range)
    const event = new ClipboardEvent('copy', { clipboardData: data })
    e.onCopy(event)
  }

  e.cut = range => {
    const data = e.toDataTransfer(range)
    const event = new ClipboardEvent('copy', { clipboardData: data })
    if (range) {
      Transforms.select(e, range)
    }
    e.onCut(event)
  }

  e.insertFromClipboard = range => {
    if (range) {
      Transforms.select(e, range)
    }
    readClipboardData().then(data => {
      const event = new ClipboardEvent('paste', { clipboardData: data })
      e.onPaste(event)
    })
  }

  e.insertTextFromClipboard = range => {
    if (range) {
      Transforms.select(e, range)
    }
    readClipboardData().then(data => {
      IS_PASTE_TEXT.set(e, true)
      const event = new ClipboardEvent('pasteText', { clipboardData: data })
      e.onPaste(event)
    })
  }

  return e
}
