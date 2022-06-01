
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
		emitName: 'keydown:enter',
	},
	{
		name: 'backspace',
		handle: Backspace,
		emitName: 'keydown:backspace',
	},
	{
		name: 'delete',
		handle: Delete,
		emitName: 'keydown:backspace',
	},
	{
		name: 'tab',
		handle: Tab,
		emitName: 'keydown:tab',
	},
	{
		name: 'shift-tab',
		handle: ShiftTab,
		emitName: 'keydown:shift-tab',
	},
	{
		name: 'shift-enter',
		handle: ShiftEnter,
		emitName: 'keydown:shift-enter',
	},
	{
		name: 'at',
		handle: At,
		emitName: 'keydown:at',
	},
	{
		name: 'space',
		handle: Space,
		emitName: 'keydown:space',
	},
	{
		name: 'slash',
		handle: Slash,
		emitName: 'keydown:slash',
	},
	{
		name: 'all',
		handle: All,
		emitName: 'keydown:all',
	},
	{
		name: 'shift-left',
		handle: ShiftLeft,
		emitName: 'keydown:shift-left',
	},
	{
		name: 'left',
		handle: Left,
		emitName: 'keydown:left',
	},
	{
		name: 'shift-right',
		handle: ShiftRight,
		emitName: 'keydown:shift-right',
	},
	{
		name: 'right',
		handle: Right,
		emitName: 'keydown:right',
	},
	{
		name: 'up',
		handle: Up,
		emitName: 'keydown:up',
	},
	{
		name: 'down',
		handle: Down,
		emitName: 'keydown:down',
	},
];

export default defaultHandles;
