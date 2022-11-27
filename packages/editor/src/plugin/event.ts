import { EventEmitter as EE } from 'events'
import { Editable } from './editable'

const EDITOR_TO_EVENT: WeakMap<Editable, EE> = new WeakMap()

type EventEndingKey<
  Set,
  Needle extends string,
  Key extends keyof Set = keyof Set,
> = Key extends `${Needle}${infer _X}` ? (_X extends `` ? never : _X) : never

type EndingKey = EventEndingKey<Editable, 'on'>

export type EventType = Lowercase<EndingKey>

export type EventHandler<
  T extends EventType,
  Key extends EndingKey = EndingKey,
> = Key extends `${Lowercase<Key>}`
  ? never
  : T extends Lowercase<Key>
  ? Editable[`on${Key}`]
  : never

export const EventEmitter = {
  get: (editor: Editable) => {
    let event = EDITOR_TO_EVENT.get(editor)
    if (!event) {
      event = new EE()
      EDITOR_TO_EVENT.set(editor, event)
    }
    return event
  },
  on: <T extends EventType>(editor: Editable, type: T, handler: EventHandler<T>) => {
    EventEmitter.get(editor).on(type, handler)
  },

  off: <T extends EventType>(editor: Editable, type: T, handler: EventHandler<T>) => {
    EventEmitter.get(editor).off(type, handler)
  },

  emit: <T extends EventType>(editor: Editable, type: T, ...args: Parameters<EventHandler<T>>) => {
    EventEmitter.get(editor).emit(type, ...args)
  },
}
