import { useEditableStatic } from '../hooks/use-editable-static'
import { useSlotComponents } from '../hooks/use-slots'

export const Slots = () => {
  const editor = useEditableStatic()
  const slots = useSlotComponents(editor)
  return (
    <>
      {slots.map(
        ({ component: Component, props: { active = true, ...props } }, index) =>
          active && <Component key={index} {...props} />,
      )}
    </>
  )
}
