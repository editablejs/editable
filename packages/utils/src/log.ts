export default class Log { 

  static nodeNotFound = (key: string) => { 
    return Log.throw(`node '${key}' not found`)
  }

  static nodeNotText = (key: string) => { 
    return Log.throw(`node '${key}' is not a text node`)
  }

  static nodeNotElement = (key: string) => { 
    return Log.throw(`node '${key}' is not a element node`)
  }

  static nodeNotInContext = (key: string) => { 
    return Log.throw(`node '${key}' is not in context`)
  }

  static offsetOutOfRange = (key: string, offset: number) => { 
    return Log.throw(`offset '${offset}' out of range for node '${key}'`)
  }

  static cannotInsertText = (key: string) => { 
    return Log.throw(`cannot insert text node into '${key}'`)
  }

  static pluginNotFound = (name: string) => { 
    return Log.throw(`plugin '${name}' not found`)
  }

  static nodeAlreadyExists = (key: string) => { 
    return Log.throw(`Node '${key}' already exists`)
  }

  static throw = (message?: string) => { 
    throw new Error(`[error] ${message}`)
  }
  
  static warn = (message?: string) => { 
    console.warn(`[warn] ${message}`)
  }

  static error = (message?: string) => {
    console.error(`[error] ${message}`)
  }
}