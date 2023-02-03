import { ListTemplate } from '@editablejs/models'

const toABC = (num: number): string => {
  return num <= 26
    ? String.fromCharCode(num + 64).toLowerCase()
    : toABC(~~((num - 1) / 26)) + toABC(num % 26 || 26)
}

const toRoman = (num: number) => {
  let map: Record<number, string> = {
    1: 'I',
    5: 'V',
    10: 'X',
    50: 'L',
    100: 'C',
    500: 'D',
    1000: 'M',
  }
  let digits = 1
  let result = ''
  while (num) {
    let current = num % 10
    if (current < 4) {
      result = map[digits].repeat(current) + result
    } else if (current === 4) {
      result = map[digits] + map[digits * 5] + result
    } else if (current > 4 && current < 9) {
      result = map[digits * 5] + map[digits].repeat(current - 5) + result
    } else {
      result = map[digits] + map[digits * 10] + result
    }
    digits *= 10
    num = Math.trunc(num / 10)
  }
  return result
}

export const OrderedListTemplates: ListTemplate[] = [
  {
    key: 'default',
    depth: 3,
    render: ({ start, level }) => {
      const l = level % 3
      switch (l) {
        case 1:
          return { type: 'a', text: `${toABC(start)}.` }
        case 2:
          return { type: 'I', text: `${toRoman(start)}.` }
        default:
          return { type: '1', text: `${start}.` }
      }
    },
  },
]
