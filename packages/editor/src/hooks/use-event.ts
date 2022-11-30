import { EventEmitter, EventHandler, EventType } from '../plugin/event'
import { useEditableStatic } from './use-editable'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

export const useEvent = <T extends EventType>(type: T, handler: EventHandler<T>) => {
  const editor = useEditableStatic()

  useIsomorphicLayoutEffect(() => {
    const event = EventEmitter.get(editor)
    event.on(type, handler)
    return () => {
      event.off(type, handler)
    }
  }, [type, handler, editor])
}
