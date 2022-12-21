import { useSlotComponents } from '../hooks/use-slot'

export const Slots = () => {
  const slots = useSlotComponents()
  return (
    <>
      {slots.map(({ component: Component, props }, index) => (
        <Component key={index} {...props} />
      ))}
    </>
  )
}
