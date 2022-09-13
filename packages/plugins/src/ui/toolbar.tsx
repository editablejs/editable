import { Tooltip, Provider, Trigger, Content } from "@radix-ui/react-tooltip";
import classNames from "classnames";
import { FC, HTMLAttributes, ReactNode } from "react";
import { Button, ButtonProps } from "./button"
import { Dropdown, DropdownProps } from "./dropdown";

export interface ToolbarButton extends ButtonProps {
  title?: ReactNode
  onToggle: () => void;
}

export const ToolbarButton: FC<ToolbarButton> = ({ title, children, onToggle, ...props }) => {

  const renderButton = () => (<Button
  onClick={onToggle}
    {...props}
    >{children}</Button>)

  return title ? <Provider><Tooltip>
    <Trigger asChild>
      {
        renderButton()
      }
    </Trigger>
    <Content>
      {
        title
      }
    </Content>
  </Tooltip>
  </Provider> : renderButton()
}

export interface ToolbarSeparator {}

export const ToolbarSeparator: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => <div className={classNames('ea-w-px ea-mr-2 ea-ml-2', className)} {...props} />

export interface ToolbarDropdown extends DropdownProps {
  onToggle: (value: string) => void;
}

export const ToolbarDropdown: React.FC<ToolbarDropdown> = ({ onToggle, defaultValue, ...props }) => {

  return <Dropdown onValueChange={onToggle} {...props} />;
};

interface Toolbar {
  Button: typeof ToolbarButton
  Dropdown: typeof ToolbarDropdown
  Separator: typeof ToolbarSeparator
}

export const Toolbar: FC<HTMLAttributes<HTMLDivElement>> & Toolbar = ({ children, className, ...props }) => {

  return (
    <div className={classNames( 'ea-z-10 ea-relative ea-flex ea-items-center', className)} {...props}>
    {
      children
    }
    </div>
  )
}

Toolbar.Button = ToolbarButton
Toolbar.Dropdown = ToolbarDropdown
Toolbar.Separator = ToolbarSeparator
