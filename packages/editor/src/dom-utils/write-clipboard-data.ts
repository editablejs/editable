import { TEXT_PLAIN, TEXT_HTML, APPLICATION_FRAGMENT_TYPE } from "@/utils/constants"
import { clearDOMSelection } from "./clear-dom-selection"
import { getFilesFromDataTransfer } from "./get-files-from-data-transfer"

const writeClipboardDataByCommand = (data: DataTransfer) => {
  return new Promise<boolean>((resolve, reject) => {
    let mark: HTMLElement | null = null
    let reselectPrevious: (() => void) | null = null
    let selection: Selection | null = null
    let range: Range | null = null
    try {
      reselectPrevious = clearDOMSelection()

      range = document.createRange()
      selection = document.getSelection()

      mark = document.createElement('span')
      mark.style.cssText = 'position: fixed; top: -9999;'
      mark.ariaHidden = 'true'
      mark.textContent = 'copy content'
      mark.style.userSelect = 'text'
      mark.addEventListener('copy', e => {
        e.stopPropagation()
        const { clipboardData } = e
        if (clipboardData) {
          e.preventDefault()
          clipboardData.clearData()
          clipboardData.setData(TEXT_PLAIN, data.getData(TEXT_PLAIN))
          clipboardData.setData(TEXT_HTML, data.getData(TEXT_HTML))
          clipboardData.setData(APPLICATION_FRAGMENT_TYPE, data.getData(APPLICATION_FRAGMENT_TYPE))
          const files = getFilesFromDataTransfer(data)
          for (const file of files) {
            clipboardData.items.add(file)
          }
          resolve(true)
        } else {
          resolve(false)
        }
      })
      document.body.appendChild(mark)

      range.selectNodeContents(mark)
      selection?.addRange(range)

      const successful = document.execCommand('copy')
      if (!successful) throw new Error('copy failed')
    } catch (error) {
      reject(error)
    } finally {
      if (selection) {
        if (range && typeof selection.removeRange == 'function') {
          selection.removeRange(range)
        } else {
          selection.removeAllRanges()
        }
      }
      if (mark) document.body.removeChild(mark)
      if (reselectPrevious) reselectPrevious()
    }
  })
}

export const writeClipboardData = (data: DataTransfer) => {
  try {
    const files = getFilesFromDataTransfer(data)

    navigator.clipboard.write([
      new ClipboardItem({
        [TEXT_PLAIN]: new Blob([data.getData(TEXT_PLAIN)], { type: TEXT_PLAIN }),
        [TEXT_HTML]: new Blob([data.getData(TEXT_HTML)], { type: TEXT_HTML }),
        // 当前不支持自定义类型
        // https://github.com/w3c/editing/blob/gh-pages/docs/clipboard-pickling/explainer.md
        // [APPLICATION_FRAGMENT_TYPE]: data.getData(APPLICATION_FRAGMENT_TYPE),
        ...files.reduce((acc, file) => ({ ...acc, [file.type]: file }), {}),
      }),
    ])
  } catch (error) {
    try {
      writeClipboardDataByCommand(data)
    } catch (error) {
      console.error(error)
    }
  }
}
