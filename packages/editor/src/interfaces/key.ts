
const generateRandomKey = () => {
  return Number(Math.random().toString().substring(2, 7) + Date.now()).toString(36)
}

let n = 0

export interface Key {
  id: string
}

export const Key = {

  create: (): Key => {
    return {
      id: `${n++}`,
    }
  },

  random: (): Key => {
    return {
      id: generateRandomKey(),
    }
  }
}
