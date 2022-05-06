import { TypingListener } from '../types';
import Enter from './enter';
import Default from './default';
import Backspace from './backspace';
import Tab from './tab';
import Space from './space';

const defaultHandles: TypingListener[] = [
	{
		name: 'default',
		handle: Default,
	},
	{
		name: 'enter',
		handle: Enter,
		emitName: 'keyup:enter',
	},
	{
		name: 'backspace',
		handle: Backspace,
		emitName: 'keyup:backspace',
	},
	{
		name: 'tab',
		handle: Tab,
		emitName: 'keyup:tab',
	},
	{
		name: 'space',
		handle: Space,
		emitName: 'keyup:space',
	},
];

export default defaultHandles;
