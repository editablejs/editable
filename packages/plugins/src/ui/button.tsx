import React from 'react'
import classNames from 'classnames'

export interface ButtonProps {
  active?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

export const Button: React.FC<ButtonProps & React.AnchorHTMLAttributes<HTMLButtonElement>> = ({
  children,
  active,
  disabled,
  className,
  type,
  ...props
}) => {
  return (
    <button
      className={classNames(
        className,
        'ea-flex ea-cursor-pointer ea-items-center ea-rounded-sm ea-border-0 ea-bg-transparent ea-px-1 ea-py-1 hover:ea-bg-gray-100 disabled:ea-cursor-not-allowed disabled:hover:ea-bg-transparent',
        { 'ea-text-primary': active },
        { 'ea-bg-blue-100': active },
        { 'hover:ea-bg-blue-100': active },
      )}
      disabled={disabled}
      onMouseDown={e => e.preventDefault()}
      {...props}
      type={(type ?? 'button') as any}
    >
      {children}
    </button>
  )
}
