import { Editable, useGridSelectionRect, Grid, useEditableStatic, useIsomorphicLayoutEffect, Locale } from "@editablejs/editor";
import React from "react";

const prefixCls = Locale.getPrefixCls('table');

export interface TableSelectionProps {
  editor: Editable
  table: Grid
}

const TableSelection: React.FC<TableSelectionProps> = () => {
  const editor = useEditableStatic()
  const rect = useGridSelectionRect()

  useIsomorphicLayoutEffect(() => {
    if(rect) {
      editor.clearSelectionDraw()
    } else {
      editor.startSelectionDraw()
    }
    
    return () => {
      editor.startSelectionDraw()
    }
  }, [editor, rect])
  
  if(!rect) return null
  const { top, left, width, height } = rect
  return <div className={`${prefixCls}-selection`} style={{ left, top, width, height }} />
}

export {
  TableSelection
}