export type EventType = string

export type EventListener = (...args: any[]) => boolean | void

export interface IEventEmitter<T extends EventType = EventType> {

  on(event: T, listener: EventListener, once?: boolean): void;

  off(event: T, listener: EventListener): void;

  once(event: T, listener: EventListener): void;

  emit(event: T, ...args: any[]): boolean | void;

  size(event?: T): number;

  removeAll(event?: T): void;
}