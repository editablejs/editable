import React from 'react'
import { useSlotComponents } from '../hooks/use-slot'

export const Slots = React.memo(() => {
  const slots = useSlotComponents()
  return (
    <>
      {slots.map(({ component: Component, props }, index) => (
        <Component key={index} {...props} />
      ))}
    </>
  )
})
Slots.displayName = 'Slots'
