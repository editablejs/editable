import { Descendant } from '@editablejs/models'
import {
  APPLICATION_FRAGMENT_TYPE,
  DATA_EDITABLE_FRAGMENT,
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
 * Convert fragment to string
 * @param fragment
 * @returns string representation of the fragment
 **/
export const fragmentToString = (fragment: Descendant[]) => {
  const string = JSON.stringify(fragment)
  return window.btoa(encodeURIComponent(string))
}

/**
 * Parse fragment from string
 * @param fragment string representation of the fragment
 * @returns fragment
 **/
export const parseFragmentFromString = (fragment: string): Descendant[] => {
  const string = decodeURIComponent(window.atob(fragment))
  try {
    return JSON.parse(string)
  } catch (error) {
    return []
  }
}

/**
 * Match fragment string from HTML
 * @param html
 * @returns string representation of the fragment
 **/
export const matchFragmentStringFromHTML = (html: string) => {
  const reg = new RegExp(`${DATA_EDITABLE_FRAGMENT}="(.+?)"`)
  return html.match(reg)?.[1] ?? ''
}

/**
 * Parse files from DataTransfer object
 * @param dataTransfer
 * @returns array of files
 **/
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
 * Parse Data from DataTransfer
 * @param dataTransfer
 * @returns DataTransferFormatData
 **/
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
 * Set Data to DataTransfer
 * @param dataTransfer
 * @param data
 **/
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
