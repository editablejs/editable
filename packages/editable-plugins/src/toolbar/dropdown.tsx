
import { Editable } from '@editablejs/editor';
import classnames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../icon';
import Button from './button';

export interface DropdownItem {
	key: string;
	content?: React.ReactNode | (<T extends Editable>(editor: T) => React.ReactChild)
	className?: string;
	disabled?: boolean;
}

interface DropdownProps { 
	editor: Editable;
	className?: string;
  activeKey?: string
	defaultActiveKey?: string
	direction?: 'vertical' | 'horizontal'
  onToggle: <T extends Editable>(editor: T, item: DropdownItem) => void;
  onActive?: <T extends Editable>(editor: T) => string;
	items: DropdownItem[]
	renderItem?: (item: DropdownItem) => React.ReactNode
	disabled?: boolean;
}

export interface ToolbarDropdown extends Omit<DropdownProps, 'activeKey' | 'editor'> { 
	type: 'dropdown'
}

const Dropdown: React.FC<DropdownProps> = ({ 
	className, 
	editor, items, onToggle, activeKey, defaultActiveKey, children, direction, renderItem: _renderItem, disabled }) => {

  const [visible, setVisible] = useState(false);

	const dropdownElRef = useRef<HTMLDivElement>(null)
  
	const toggerSelect = (item: DropdownItem) => {
		hideList();
		onToggle(editor, item)
	}

	const hideList = useCallback((event?: MouseEvent) => {
		if (
			event &&
			dropdownElRef.current &&
			dropdownElRef.current.contains(event.target as Node)
		)
			return;
		setVisible(false);
	}, []);

	const showList = () => {
		setVisible(true);
	};

  const toggleVisible = () => {
		if (visible) {
			hideList();
		} else {
			showList();
		}
	};

	useEffect(() => {
		if (visible) document.addEventListener('click', hideList);
		return () => {
			document.removeEventListener('click', hideList);
		};
	}, [hideList, visible]);

	const renderContent = () => {
		if(children) return children
		const key = (activeKey || defaultActiveKey)
		const activeItem = key ? items.find(item => item.key === key) ?? items[0] : items[0]
		return activeItem.content
	}

	const renderList = () => { 
		if(!visible) return
		return (
			<div
			className={classnames(
				'toolbar-dropdown-list',
				`toolbar-dropdown-${direction ?? 'vertical'}`,
				className,
			)}
		>
			{items.map((item) => _renderItem ? _renderItem(item) : renderItem(item))}
		</div>
		)
	}

	const renderItem = (item: DropdownItem) => { 
		const { key, disabled, className, content } = item
		return (
			<a
			key={key}
			className={classnames('toolbar-dropdown-item', className, {
				'toolbar-dropdown-item-disabled': disabled,
			})}
			onMouseDown={(event) => {
				event.preventDefault()
				if (disabled) return;
				return toggerSelect(item);
			}}
		>
			{typeof content === 'function' ? content(editor) : content}
			{
				direction !== 'horizontal' && activeKey === key && <Icon name='check' />
			}
		</a>
	);
	}

  const render = () => {
    return (
      <div
				ref={dropdownElRef}
        className={classnames('toolbar-dropdown', {'toolbar-dropdown-active': visible})}
      >
        <Button onToggle={toggleVisible} editor={editor} active={visible} disabled={disabled}>{ renderContent() }</Button>
				{
					renderList()
				}
      </div>
    );
  }

  return render()
}

export default Dropdown