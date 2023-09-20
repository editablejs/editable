export type Listener = (...args: any[]) => void

export class Emitter {
  static listenerCount(emitter: Emitter, type: string | number): number {
    return emitter.listenerCount(type)
  }

  static defaultMaxListeners: number = 10

  events: Record<string | number, Listener | Listener[]> = {}

  maxListeners: number | undefined = undefined

  eventsCount = 0

  listenerCount(type: string | number): number {
    const evlistener = this.events[type]

    if (typeof evlistener === 'function') {
      return 1
    } else if (evlistener !== undefined) {
      return evlistener.length
    }

    return 0
  }

  eventNames(): Array<string | number> {
    return Object.keys(this.events)
  }

  setMaxListeners(count: number): this {
    this.maxListeners = count
    return this
  }

  getMaxListeners(): number {
    return this.maxListeners ?? Emitter.defaultMaxListeners
  }

  emit(type: string | number, ...args: any[]): boolean {
    const handler = this.events[type]

    if (handler === undefined) return false

    if (typeof handler === 'function') {
      handler(...args)
    } else {
      const len = handler.length
      for (let i = 0; i < len; ++i) handler[i](...args)
    }

    return true
  }

  on(type: string | number, listener: Listener, prepend = false): this {
    let existing = this.events[type]
    if (existing === undefined) {
      // Optimize the case of one listener. Don't need the extra array object.
      this.events[type] = listener
      ++this.eventsCount
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = this.events[type] = prepend ? [listener, existing] : [existing, listener]
        // If we've already got an array, just append.
      } else if (prepend) {
        existing.unshift(listener)
      } else {
        existing.push(listener)
      }

      // Check for listener leak
      const maxCount = this.getMaxListeners()
      if (maxCount > 0 && existing.length > maxCount) {
        // No error code for this since it is a Warning
        // eslint-disable-next-line no-restricted-syntax
        const e = new Error(
          'Possible EventEmitter memory leak detected. ' +
            existing.length +
            ' ' +
            String(type) +
            ' listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit',
        )
        console.warn(e)
      }
    }

    return this
  }

  off(type: string | number, listener: Listener): this {
    const list = this.events[type]
    if (list === undefined) return this

    if (list === listener) {
      if (--this.eventsCount === 0) this.events = {}
      else {
        delete this.events[type]
      }
    } else if (typeof list !== 'function') {
      let position = -1

      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i] === listener) {
          position = i
          break
        }
      }

      if (position < 0) return this

      if (position === 0) list.shift()
      else {
        list.splice(position, 1)
      }

      if (list.length === 1) this.events[type] = list[0]
    }

    return this
  }

  once(type: string | number, listener: Listener, prepend = false): this {
    const wrapper = (...args: any[]) => {
      this.off(type, wrapper)
      listener(...args)
    }
    return this.on(type, wrapper, prepend)
  }
}
