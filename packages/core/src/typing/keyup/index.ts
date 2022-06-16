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
		emitName: 'enter:keyup',
	},
	{
		name: 'backspace',
		handle: Backspace,
		emitName: 'backspace:keyup',
	},
	{
		name: 'tab',
		handle: Tab,
		emitName: 'tab:keyup',
	},
	{
		name: 'space',
		handle: Space,
		emitName: 'space:keyup',
	},
];

export default defaultHandles;
