import { useEditableStatic } from '../hooks/use-editable-static'
import { useSlots } from '../hooks/use-slots'

export const Slots = () => {
  const editor = useEditableStatic()
  const slots = useSlots(editor)
  return (
    <>
      {slots.map((Component, index) => (
        <Component key={index} />
      ))}
    </>
  )
}
