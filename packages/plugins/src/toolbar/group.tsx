import { Editable } from "@editablejs/editor"
import React from "react"
import Button, { ToolbarButton } from "./button"
import Dropdown, { ToolbarDropdown } from "./dropdown"

export type GroupItem = ToolbarButton | ToolbarDropdown
export interface ToolbarGroupProps {
  editor: Editable
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
          default:
            return null
        }
      })
    }
  </div>
}

export default ToolbarGroup