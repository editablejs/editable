import { NodeOperation } from '@editablejs/models'
import { OpMapper } from '../types'
import { insertNode } from './insert-node'
import { mergeNode } from './merge-node'
import { moveNode } from './move-node'
import { removeNode } from './remove-node'
import { setNode } from './set-node'
import { splitNode } from './split-node'

export const NODE_MAPPER: OpMapper<NodeOperation> = {
  insert_node: insertNode,
  remove_node: removeNode,
  set_node: setNode,
  merge_node: mergeNode,
  move_node: moveNode,
  split_node: splitNode,
}
