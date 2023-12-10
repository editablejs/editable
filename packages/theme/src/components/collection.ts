
import { RefObject, createContext, useContext, virtual, useRef, useEffect, useCallback, define, html } from 'rezon'
import { useComposedRefs } from './compose-refs'
import { Slot, SlotProps } from './slot'

type CollectionElement = HTMLElement
interface CollectionProps extends SlotProps { }

// We have resorted to returning slots directly rather than exposing primitives that can then
// be slotted like `<CollectionItem as={Slot}>…</CollectionItem>`.
// This is because we encountered issues with generic types that cannot be statically analysed
// due to creating them dynamically via createCollection.

function createCollection<ItemElement extends HTMLElement, ItemData = {}>(name: string) {
  /* -----------------------------------------------------------------------------------------------
   * CollectionProvider
   * ---------------------------------------------------------------------------------------------*/

  type ContextValue = {
    collectionRef: RefObject<CollectionElement>
    itemMap: Map<RefObject<ItemElement>, { ref: RefObject<ItemElement> } & ItemData>
  }

  const CollectionContext = createContext<ContextValue>({
    collectionRef: { current: null },
    itemMap: new Map(),
  })

  define(CollectionContext.Provider, "collection-context-provider")
  define(CollectionContext.Consumer, "collection-context-consumer")

  const useCollectionContext = () => useContext(CollectionContext)

  const CollectionProvider = virtual<{ children?: unknown }>(props => {
    const { children } = props
    const ref = useRef<CollectionElement>(null)
    const itemMap = useRef<ContextValue['itemMap']>(new Map()).current
    return html`<collection-context-provider .value=${{
      itemMap,
      collectionRef: ref,
    }}>${children}</collection-context-provider>`
  })

  /* -----------------------------------------------------------------------------------------------
   * CollectionSlot
   * ---------------------------------------------------------------------------------------------*/

  const CollectionSlot = virtual<CollectionProps>(
    (props) => {
      const { ref, children } = props
      const context = useCollectionContext()
      const composedRefs = useComposedRefs(ref, context.collectionRef)
      return Slot({ ref: composedRefs, children })
    },
  )

  /* -----------------------------------------------------------------------------------------------
   * CollectionItem
   * ---------------------------------------------------------------------------------------------*/

  const ITEM_DATA_ATTR = 'data-collection-item'

  type CollectionItemSlotProps = ItemData & {
    children: unknown
    ref?: RefObject<ItemElement>
  }

  const CollectionItemSlot = virtual<CollectionItemSlotProps>(
    (props) => {
      const { children, ref: refProp, ...itemData } = props
      const ref = useRef<ItemElement>(null)
      const composedRefs = useComposedRefs(refProp, ref)
      const context = useCollectionContext()

      useEffect(() => {
        context.itemMap.set(ref, { ref, ...(itemData as unknown as ItemData) })
        return () => void context.itemMap.delete(ref)
      })

      return Slot({ ...{ [ITEM_DATA_ATTR]: '' }, ref: composedRefs, children })
    },
  )

  /* -----------------------------------------------------------------------------------------------
   * useCollection
   * ---------------------------------------------------------------------------------------------*/

  function useCollection() {
    const context = useCollectionContext()

    const getItems = useCallback(() => {
      const collectionNode = context.collectionRef.current
      if (!collectionNode) return []
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`))
      const items = Array.from(context.itemMap.values())
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current!) - orderedNodes.indexOf(b.ref.current!),
      )
      return orderedItems
    }, [context.collectionRef, context.itemMap])

    return getItems
  }

  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection,
  ] as const
}

export { createCollection }
export type { CollectionProps }
