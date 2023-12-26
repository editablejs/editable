import { createContext, html, useContext, c } from "rezon"


type Direction = 'ltr' | 'rtl'
const DirectionContext = createContext<Direction | undefined>(undefined)

/* -------------------------------------------------------------------------------------------------
 * Direction
 * -----------------------------------------------------------------------------------------------*/

interface DirectionProviderProps {
  children?: unknown
  dir: Direction
}
const DirectionProvider = c<DirectionProviderProps>(props => {
  const { dir, children } = props
  return html`<direction-context-provider .value=${dir}>${children}</direction-context-provider>`
})

/* -----------------------------------------------------------------------------------------------*/

function useDirection(localDir?: Direction) {
  const globalDir = useContext(DirectionContext)
  return localDir || globalDir || 'ltr'
}

const Provider = DirectionProvider

export {
  useDirection,
  //
  Provider,
  //
  DirectionProvider,
}
