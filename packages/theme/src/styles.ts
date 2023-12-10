import { shallow } from '@editablejs/utils/shallow'
import { useMemo, useRef } from "rezon"
import { css } from "twin.macro"

export const createStyles = <Params = void>(callback: (parmas: Params) => unknown) => {
  const useStyle = (parmas: Params) => {
    const stylesRef = useRef<unknown>()
    const resultRef = useRef<unknown>()
    return useMemo(() => {
      if (shallow(stylesRef.current, parmas)) return resultRef.current
      stylesRef.current = parmas
      const styles = callback(parmas)
      let result: unknown
      if (Array.isArray(styles)) {
        result = css(...styles)
      } else {
        result = css(styles as TemplateStringsArray)
      }
      resultRef.current = result
      return result
    }, [parmas])


  }
  return useStyle
}
