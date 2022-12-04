import * as React from 'react'
import { IconRestart } from '../../icon/restart'
export interface ResetButtonProps {
  onReset: () => void
}

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      tw="dark:text-primary-dark hover:text-link mx-1 inline-flex items-center text-sm text-primary transition duration-100 ease-in"
      onClick={onReset}
      title="Reset Sandbox"
      type="button"
    >
      <IconRestart tw="relative ml-1 mr-1 inline" /> Reset
    </button>
  )
}
