import { Descendant } from "@/interfaces"
import { APPLICATION_FRAGMENT_TYPE, TEXT_HTML, TEXT_PLAIN } from "@/utils/constants"
import { convertFragmentToString } from "./convert-fragment-to-string"

interface DataTransfer {
  html: string
  text: string
  fragment: Descendant[]
  files: File[]
}

type DOMDataTransfer = globalThis.DataTransfer

export const setDataToDataTransfer = (dataTransfer: DOMDataTransfer, data: Partial<DataTransfer>) => {
  const { text, html, fragment, files } = data
  if (text) dataTransfer.setData(TEXT_PLAIN, text)
  if (html) dataTransfer.setData(TEXT_HTML, html)
  if (fragment) dataTransfer.setData(APPLICATION_FRAGMENT_TYPE, convertFragmentToString(fragment))
  if (files) {
    for (const file of files) {
      dataTransfer.items.add(file)
    }
  }
}
