import { Grid, Element } from '@editablejs/models'
import { TABLE_KEY } from '../constants'
import { TableRow } from '../../row'

export interface Table extends Grid {
  type: typeof TABLE_KEY
  children: TableRow[]
}

export const Table = {
  isTable: (value: any): value is Table => {
    return Element.isElement(value) && value.type === TABLE_KEY
  },
}
