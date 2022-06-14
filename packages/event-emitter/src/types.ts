export type EventType = string

export type EventListener = (...args: any[]) => boolean | void

export interface IEventEmitter<T extends EventType = EventType> {

  on(event: T, listener: EventListener, once?: boolean): void;

  off(event: T, listener: EventListener): void;

  once(event: T, listener: EventListener): void;

  emit<R extends any = any>(event: T, ...args: any[]): R;

  size(event?: T): number;

  removeAll(event?: T): void;
}