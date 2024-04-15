import { APPLICATION_FRAGMENT_TYPE, TEXT_HTML, TEXT_PLAIN } from "@/utils/constants"
import { getFilesFromDataTransfer } from "./get-files-from-data-transfer"
import { matchFragmentStringFromHTML } from "./match-fragment-string-from-html"
import { parseFragmentFromString } from "./parse-fragment-from-string"

export const parseFromDataTransfer = (dataTransfer: DataTransfer) => {
  const text = dataTransfer.getData(TEXT_PLAIN)
  const html = dataTransfer.getData(TEXT_HTML)
  let fragment = dataTransfer.getData(APPLICATION_FRAGMENT_TYPE)
  if (!fragment) fragment = matchFragmentStringFromHTML(html)
  return {
    text,
    html,
    fragment: fragment ? parseFragmentFromString(fragment) : [],
    files: getFilesFromDataTransfer(dataTransfer),
  }
}
