import { EditableEditor } from "@editablejs/editor"
import React from "react"
import Button from "./button"
import Dropdown from "./dropdown"
import { GroupItem } from "./types"

export interface ToolbarGroupProps {
  editor: EditableEditor
  items: GroupItem[]
}

const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ editor, items }) => {

  return <div className="toolbar-group">
    {
      items.map((item, index) => {
        switch(item.type) {
          case 'button':
            return <Button key={index} {...item} editor={editor} />
          case 'dropdown':
            return <Dropdown key={index} {...item} editor={editor} />
        }
      })
    }
  </div>
}

export default ToolbarGroup