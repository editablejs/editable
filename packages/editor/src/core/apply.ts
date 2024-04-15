import { PathRef } from '../interfaces/path-ref'
import { PointRef } from '../interfaces/point-ref'
import { RangeRef } from '../interfaces/range-ref'
import { FLUSHING } from '../utils/weak-maps'
import { Path } from '../interfaces/path'
import { Transforms } from '../interfaces/transforms'
import { WithEditorFirstArg } from '../utils/types'
import { Editor } from '../interfaces/editor'
import { isBatchingDirtyPaths } from './batch-dirty-paths'
import { updateDirtyPaths } from './update-dirty-paths'
import { clearMarks } from './marks'
import { clearElements } from './elements'
import { Key } from '@/interfaces'
import { cacheBeforeOperationNodes } from '@/utils/transforms'

export const apply: WithEditorFirstArg<Editor['apply']> = (editor, op) => {
  const matches: [Path, Key][] = []

  switch (op.type) {
    case 'insert_text':
    case 'remove_text':
    case 'set_node':
    case 'split_node': {
      const matches = getMatches(editor, op.path)
      matches.push(...matches)
      break
    }

    case 'set_selection': {
      break
    }

    case 'insert_node':
    case 'remove_node': {
      matches.push(...getMatches(editor, Path.parent(op.path)))
      break
    }

    case 'merge_node': {
      const prevPath = Path.previous(op.path)
      matches.push(...getMatches(editor, prevPath))
      break
    }

    case 'move_node': {
      const commonPath = Path.common(Path.parent(op.path), Path.parent(op.newPath))
      matches.push(...getMatches(editor, commonPath))
      break
    }
  }
  cacheBeforeOperationNodes(editor, op)

  for (const ref of Editor.pathRefs(editor)) {
    PathRef.transform(ref, op)
  }

  for (const ref of Editor.pointRefs(editor)) {
    PointRef.transform(ref, op)
  }

  for (const ref of Editor.rangeRefs(editor)) {
    RangeRef.transform(ref, op)
  }

  // update dirty paths
  if (!isBatchingDirtyPaths(editor)) {
    const transform = Path.operationCanTransformPath(op)
      ? (p: Path) => Path.transform(p, op)
      : undefined
    updateDirtyPaths(editor, editor.getDirtyPaths(op), transform)
  }

  Transforms.transform(editor, op)
  editor.operations.push(op)
  Editor.normalize(editor, {
    operation: op,
  })

  clearMarks(editor)
  clearElements(editor)

  if (!FLUSHING.get(editor)) {
    FLUSHING.set(editor, true)

    Promise.resolve().then(() => {
      FLUSHING.set(editor, false)
      editor.onChange({ operation: op })
      editor.operations = []
    })
  }
  // if (!Focused.getState(e) && canForceTakeFocus()) {
  //   e.focus()
  // }
}

const getMatches = (editor: Editor, path: Path) => {
  const matches: [Path, Key][] = []
  for (const [n, p] of Editor.levels(editor, { at: path })) {
    const key = Editor.findKey(editor, n)
    matches.push([p, key])
  }
  return matches
}
