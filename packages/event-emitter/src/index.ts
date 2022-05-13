import { EventType, IEventEmitter, EventListener } from "./types";

export default class EventEmitter<T extends EventType = EventType> implements IEventEmitter<T> {
 
  private readonly listeners: Map<string, { once: boolean, fn: EventListener }[]> = new Map();

  on = (event: string, listener: EventListener, once: boolean = false): void => {
    this.listeners.set(event, [...(this.listeners.get(event) || []), { once, fn: listener }]);
  }

  off = (event: string, listener: EventListener): void => {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.findIndex(item => item.fn === listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  once = (event: string, listener: EventListener): void => {
    this.on(event, listener, true);
  }

  emit = (event: string, ...args: any[]) => {
    const listeners = this.listeners.get(event) || [];
    const r = listeners.some(({ once, fn }) => {
      const result = fn(...args);
      if (once) { 
        this.off(event, fn);
      }
      if(result === false) return true;
      return false
    })
    if(r) return false;
  }

  size = (event?: T): number => {
    if(event) { 
      return this.listeners.get(event)?.length || 0
    }
    return this.listeners.size
  }

  removeAll = (event?: T): void => {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear()
    }
  }
}

export type {
  EventType, IEventEmitter, EventListener
}