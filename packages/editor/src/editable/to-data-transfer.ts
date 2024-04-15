import { convertFragmentToString } from "@/dom-utils";
import { Editor, HTMLSerializer, Range, TextSerializer } from "@/interfaces";
import { APPLICATION_FRAGMENT_TYPE, DATA_EDITABLE_FRAGMENT, TEXT_HTML, TEXT_PLAIN } from "@/utils/constants";

export const toDataTransfer = (editor: Editor, range?: Range) => {
  const fragment = editor.getFragment(range)
  const fragmentString = convertFragmentToString(fragment)

  const text = fragment.map(node => TextSerializer.apply(editor, node)).join('\n')

  let html = fragment.map(node => HTMLSerializer.apply(editor, node)).join('')
  html = `<div ${DATA_EDITABLE_FRAGMENT}="${fragmentString}">${html}</div>`
  html = `<html><head><meta name="source" content="${DATA_EDITABLE_FRAGMENT}" /></head><body>${html}</body></html>`
  const dataTransfer = new DataTransfer()
  dataTransfer.setData(TEXT_PLAIN, text)
  dataTransfer.setData(TEXT_HTML, html)
  dataTransfer.setData(APPLICATION_FRAGMENT_TYPE, fragmentString)
  return dataTransfer
}
