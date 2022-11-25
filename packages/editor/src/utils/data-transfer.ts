import { Descendant } from 'slate'
import {
  APPLICATION_FRAGMENT_TYPE,
  DATA_EDITABLEJS_FRAGMENT,
  TEXT_HTML,
  TEXT_PLAIN,
} from './constants'

interface DataTransferFormatData {
  html: string
  text: string
  fragment: Descendant[]
  files: File[]
}

/**
 * fragment 转换为字符串
 * @param fragment
 * @returns
 */
export const fragmentToString = (fragment: Descendant[]) => {
  const string = JSON.stringify(fragment)
  return window.btoa(encodeURIComponent(string))
}

/**
 * 从字符串中解析 fragment
 * @param fragment
 * @returns
 */
export const parseFragmentFromString = (fragment: string): Descendant[] => {
  const string = decodeURIComponent(window.atob(fragment))
  return JSON.parse(string)
}

/**
 * 匹配 html 中的 fragment
 * @param html
 * @returns
 */
export const matchFragmentStringFromHTML = (html: string) => {
  const reg = new RegExp(`${DATA_EDITABLEJS_FRAGMENT}="(.+?)"`)
  return html.match(reg)?.[1] ?? ''
}

/**
 * 解析 DataTransfer 中的文件
 * @param dataTransfer
 * @returns
 */
export const parseDataTransferFiles = (dataTransfer: DataTransfer) => {
  let files: File[] = []

  try {
    if (dataTransfer.items && dataTransfer.items.length > 0) {
      for (const item of dataTransfer.items) {
        let file = item.kind === 'file' ? item.getAsFile() : null
        if (file !== null) {
          if (file.type && file.type.indexOf('image/png') > -1 && !file.lastModified) {
            file = new File([file], 'image.png', {
              type: file.type,
            })
          }
        }
        if (file) files.push(file)
      }
    } else if (dataTransfer.files && dataTransfer.files.length > 0) {
      files = Array.from(dataTransfer.files)
    }
  } catch (err) {
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      files = Array.from(dataTransfer.files)
    }
  }
  return files
}

/**
 * 解析 DataTransfer 中的数据
 * @param dataTransfer
 * @returns
 */
export const parseDataTransfer = (dataTransfer: DataTransfer): DataTransferFormatData => {
  const text = dataTransfer.getData(TEXT_PLAIN)
  const html = dataTransfer.getData(TEXT_HTML)
  let fragment = dataTransfer.getData(APPLICATION_FRAGMENT_TYPE)
  if (!fragment) fragment = matchFragmentStringFromHTML(html)
  return {
    text,
    html,
    fragment: fragment ? parseFragmentFromString(fragment) : [],
    files: parseDataTransferFiles(dataTransfer),
  }
}

/**
 * 设置数据到 DataTransfer 中
 * @param dataTransfer
 * @param data
 */
export const setDataTransfer = (
  dataTransfer: DataTransfer,
  data: Partial<DataTransferFormatData>,
) => {
  const { text, html, fragment, files } = data
  if (text) dataTransfer.setData(TEXT_PLAIN, text)
  if (html) dataTransfer.setData(TEXT_HTML, html)
  if (fragment) dataTransfer.setData(APPLICATION_FRAGMENT_TYPE, fragmentToString(fragment))
  if (files) {
    for (const file of files) {
      dataTransfer.items.add(file)
    }
  }
}
