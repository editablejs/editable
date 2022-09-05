import React from 'react';
import classNames from 'classnames'
import { getPrefixCls } from '../utils';
import './style.less'

export interface ButtonProps { 
  active?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

export const Button: React.FC<ButtonProps & React.AnchorHTMLAttributes<HTMLButtonElement>> =({ children, active, disabled, className, type, ...props }) => {

  const prefixCls = getPrefixCls('btn')

  return <button className={classNames(prefixCls, {[`${prefixCls}-active`]: active}, className)} disabled={disabled} {...props} type={(type ?? 'button') as any}>{ children }</button>
}