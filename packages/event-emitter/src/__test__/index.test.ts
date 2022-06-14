import EventEmitter from '..'

describe("event-emitter", () => {
  it("on", () => {
    const eventEmitter = new EventEmitter()
    eventEmitter.on('test', () => { 
    })
    expect(eventEmitter.size('test')).toBe(1)
  });
  it("once", () => {
    const eventEmitter = new EventEmitter()
    eventEmitter.once('test', () => { 
    })
    eventEmitter.emit('test')
    expect(eventEmitter.size('test')).toBe(0)
  });
  it("off", () => {
    const eventEmitter = new EventEmitter()
    const fn = () => { 
    }
    eventEmitter.on('test', fn)
    eventEmitter.off('test', fn)
    expect(eventEmitter.size('test')).toBe(0)
  });
  it("emit", () => {
    const eventEmitter = new EventEmitter()
    eventEmitter.on('test', () => { 
    })
    eventEmitter.on('test', () => { 
      return false
    })
    eventEmitter.on('test', () => { 
    })
    expect(eventEmitter.emit('test')).toBe(false)
  })
  it("size", () => {
    const eventEmitter = new EventEmitter()
    const fn1 = () => { 
    }
    const fn2 = () => { 
    }
    eventEmitter.on('test', fn1)
    eventEmitter.on('test', fn2)
    expect(eventEmitter.size('test')).toBe(2)
  });
  it("removeAll", () => {
    const eventEmitter = new EventEmitter()
    eventEmitter.on('test', () => { 
    })
    eventEmitter.on('test', () => { 
    })
    expect(eventEmitter.size('test')).toBe(2)
    eventEmitter.removeAll('test')
    expect(eventEmitter.size('test')).toBe(0)
  })
});
