import { APPLICATION_FRAGMENT_TYPE, TEXT_HTML, TEXT_PLAIN } from "@/utils/constants"
import { matchFragmentStringFromHTML } from "./match-fragment-string-from-html"
import { clearDOMSelection } from "./clear-dom-selection"

const readClipboardDataByCommand = () => {
  return new Promise<DataTransfer | null>((resolve, reject) => {
    let textarea: HTMLTextAreaElement | null = null
    let reselectPrevious: (() => void) | null = null

    let selection: Selection | null = null
    try {
      reselectPrevious = clearDOMSelection()

      selection = document.getSelection()

      textarea = document.createElement('textarea')
      textarea.style.cssText = 'position: fixed; top: -9999; left: -9999; opacity: 0;'

      textarea.addEventListener('paste', e => {
        e.preventDefault()
        e.stopPropagation()
        resolve(e.clipboardData)
      })

      document.body.appendChild(textarea)

      textarea.focus()

      const successful = document.execCommand('paste')
      if (!successful) throw new Error('paste failed')
    } catch (error) {
      reject(error)
    } finally {
      if (selection) {
        selection.removeAllRanges()
      }
      if (textarea) document.body.removeChild(textarea)
      if (reselectPrevious) reselectPrevious()
    }
  })
}

export const readClipboardData = async () => {
  let text = ''
  let html = ''
  let fragment = ''
  const dataTransfer = new DataTransfer()
  try {
    const items = await navigator.clipboard.read()
    for (const item of items) {
      try {
        text += await (await item.getType(TEXT_PLAIN)).text()
      } catch { }
      try {
        html += await (await item.getType(TEXT_HTML)).text()
      } catch { }
      if (!fragment) {
        try {
          fragment = await (await item.getType(APPLICATION_FRAGMENT_TYPE)).text()
        } catch (error) {
          fragment = matchFragmentStringFromHTML(html)
        }
      }

      for (const type of item.types) {
        if (~[APPLICATION_FRAGMENT_TYPE, TEXT_PLAIN, TEXT_HTML].indexOf(type)) continue
        const blob = await item.getType(type)
        const file = new File([blob], 'unknow', {
          type,
        })
        dataTransfer.items.add(file)
      }
    }
  } catch (error) {
    try {
      const data = await readClipboardDataByCommand()
      if (data) return data
    } catch (error) {
      console.error(error)
    }
  }
  dataTransfer.setData(TEXT_PLAIN, text)
  dataTransfer.setData(TEXT_HTML, html)
  dataTransfer.setData(APPLICATION_FRAGMENT_TYPE, fragment)
  return dataTransfer
}
