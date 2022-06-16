
import Backspace from './backspace';
import Default from './default';
import Delete from './delete';
import Enter from './enter';
import Tab from './tab';
import ShiftTab from './shift-tab';
import ShiftEnter from './shift-enter';
import At from './at';
import Space from './space';
import Slash from './slash';
import All from './all';
import Left from './left';
import Right from './right';
import Up from './up';
import Down from './down';
import ShiftLeft from './shift-left';
import ShiftRight from './shift-right';
import { TypingListener } from '../types';

const defaultHandles: TypingListener[] = [
	{
		name: 'default',
		handle: Default,
	},
	{
		name: 'enter',
		handle: Enter,
		emitName: 'enter',
	},
	{
		name: 'backspace',
		handle: Backspace,
		emitName: 'backspace',
	},
	{
		name: 'delete',
		handle: Delete,
		emitName: 'backspace',
	},
	{
		name: 'tab',
		handle: Tab,
		emitName: 'tab',
	},
	{
		name: 'shift-tab',
		handle: ShiftTab,
		emitName: 'shift-tab',
	},
	{
		name: 'shift-enter',
		handle: ShiftEnter,
		emitName: 'shift-enter',
	},
	{
		name: 'at',
		handle: At,
		emitName: 'at',
	},
	{
		name: 'space',
		handle: Space,
		emitName: 'space',
	},
	{
		name: 'slash',
		handle: Slash,
		emitName: 'slash',
	},
	{
		name: 'all',
		handle: All,
		emitName: 'all',
	},
	{
		name: 'shift-left',
		handle: ShiftLeft,
		emitName: 'shift-left',
	},
	{
		name: 'left',
		handle: Left,
		emitName: 'left',
	},
	{
		name: 'shift-right',
		handle: ShiftRight,
		emitName: 'shift-right',
	},
	{
		name: 'right',
		handle: Right,
		emitName: 'right',
	},
	{
		name: 'up',
		handle: Up,
		emitName: 'up',
	},
	{
		name: 'down',
		handle: Down,
		emitName: 'down',
	},
];

export default defaultHandles;
