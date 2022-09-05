
import classnames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../icon';
import { Button } from '../button';
import { getPrefixCls } from '../utils';
import './style.less'

export interface DropdownItem {
	key: string;
	content?: React.ReactNode
	className?: string;
	disabled?: boolean;
}

export interface DropdownProps { 
	className?: string;
  activeKey?: string
	defaultActiveKey?: string
	disabled?: boolean;
	direction?: 'vertical' | 'horizontal'
	items: DropdownItem[]
	renderItem?: (item: DropdownItem) => React.ReactNode
  onSelect?: (item: DropdownItem) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
	className, items, activeKey, defaultActiveKey, children, direction, renderItem: _renderItem, disabled, onSelect }) => {

  const [visible, setVisible] = useState(false);

	const dropdownElRef = useRef<HTMLDivElement>(null)

  const prefixCls = getPrefixCls('dropdown')
  
	const toggerSelect = (item: DropdownItem) => {
		hideList();
    if(onSelect) onSelect(item)
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

  const toggleVisible = (e: React.MouseEvent) => {
    e.preventDefault()
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
				`${prefixCls}-list`,
				`${prefixCls}-${direction ?? 'vertical'}`,
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
			className={classnames(`${prefixCls}-item`, className, {
				[`${prefixCls}-item-disabled`]: disabled,
			})}
			onMouseDown={(event) => {
				event.preventDefault()
				if (disabled) return;
				return toggerSelect(item);
			}}
		>
			{content}
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
        className={classnames(prefixCls, {[`${prefixCls}-active`]: visible})}
      >
        <Button onMouseDown={toggleVisible} active={visible} disabled={disabled}>{ renderContent() }</Button>
				{
					renderList()
				}
      </div>
    );
  }

  return render()
}