import { Editable } from '@editablejs/editor'
import { Popover, PopoverContent, PopoverTrigger } from '@editablejs/ui'
import { FC, useEffect, useState } from 'react'
import { useMentionSearchValue } from '../hooks/use-mention-search'

export interface MentionSearchProps {
  editor: Editable
}

export const MentionSearch: FC<MentionSearchProps> = ({ editor, children }) => {
  const searchValue = useMentionSearchValue(editor)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setOpen(true)
  }, [])
  return (
    <Popover open={open}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent sideOffset={5} align="start">
        <div tw="shadow p-3 rounded-md">TODO: Search user `{searchValue}`</div>
      </PopoverContent>
    </Popover>
  )
}
