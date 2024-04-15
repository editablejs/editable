import { Descendant } from "@/interfaces"

export const convertFragmentToString = (fragment: Descendant[]) => {
  const string = JSON.stringify(fragment)
  return window.btoa(encodeURIComponent(string))
}
