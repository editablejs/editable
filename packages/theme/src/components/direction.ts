import { createContext, define, html, useContext, virtual } from "rezon"


type Direction = 'ltr' | 'rtl'
const DirectionContext = createContext<Direction | undefined>(undefined)

define(DirectionContext.Provider, "direction-context-provider")
define(DirectionContext.Consumer, "direction-context-consumer")

/* -------------------------------------------------------------------------------------------------
 * Direction
 * -----------------------------------------------------------------------------------------------*/

interface DirectionProviderProps {
  children?: unknown
  dir: Direction
}
const DirectionProvider = virtual<DirectionProviderProps>(props => {
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
