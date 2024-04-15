import { DATA_EDITABLE_FRAGMENT } from "@/utils/constants"

export const matchFragmentStringFromHTML = (html: string) => {
  const reg = new RegExp(`${DATA_EDITABLE_FRAGMENT}="(.+?)"`)
  return html.match(reg)?.[1] ?? ''
}
