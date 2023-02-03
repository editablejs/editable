import { APPLICATION_FRAGMENT_TYPE, TEXT_HTML, TEXT_PLAIN } from './constants'
import { matchFragmentStringFromHTML, parseDataTransferFiles } from './data-transfer'
import { isDOMHTMLElement } from '@editablejs/models'

const deselectCurrent = () => {
  const selection = document.getSelection()
  if (!selection?.rangeCount) {
    return function () {}
  }
  let active: HTMLElement | null = null
  let activeElement = document.activeElement
  if (activeElement && activeElement.shadowRoot) {
    activeElement = activeElement.shadowRoot.activeElement
  }
  if (isDOMHTMLElement(activeElement)) {
    active = activeElement
  }
  const ranges: Range[] = []
  for (var i = 0; i < selection.rangeCount; i++) {
    ranges.push(selection.getRangeAt(i))
  }
  switch (
    active?.tagName.toUpperCase() // .toUpperCase handles XHTML
  ) {
    case 'INPUT':
    case 'TEXTAREA':
      active.blur()
      break

    default:
      active = null
      break
  }

  selection.removeAllRanges()
  return () => {
    if (selection.type === 'Caret') {
      selection.removeAllRanges()
    }

    if (!selection.rangeCount) {
      ranges.forEach(range => {
        selection.addRange(range)
      })
    }
    if (active) {
      active.focus()
    }
  }
}

export const readClipboardDataByCommand = () => {
  return new Promise<DataTransfer | null>((resolve, reject) => {
    let textarea: HTMLTextAreaElement | null = null
    let reselectPrevious: (() => void) | null = null

    let selection: Selection | null = null
    try {
      reselectPrevious = deselectCurrent()

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
      } catch {}
      try {
        html += await (await item.getType(TEXT_HTML)).text()
      } catch {}
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

export const writeClipboardDataByCommand = (data: DataTransfer) => {
  return new Promise<boolean>((resolve, reject) => {
    let mark: HTMLElement | null = null
    let reselectPrevious: (() => void) | null = null
    let selection: Selection | null = null
    let range: Range | null = null
    try {
      reselectPrevious = deselectCurrent()

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
          const files = parseDataTransferFiles(data)
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
    const files = parseDataTransferFiles(data)

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
