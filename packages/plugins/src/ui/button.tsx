import React from 'react';
import classNames from 'classnames';

export interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
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
        'ea-cursor-pointer ea-border-0 ea-rounded-sm ea-bg-transparent ea-px-1 ea-py-1 ea-flex ea-items-center hover:ea-bg-gray-100 disabled:hover:ea-bg-transparent disabled:ea-cursor-not-allowed',
        { 'ea-bg-gray-100': active },
      )}
      disabled={disabled}
      onMouseDown={e => e.preventDefault()}
      {...props}
      type={(type ?? 'button') as any}
    >
      {children}
    </button>
  );
};
