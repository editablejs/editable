import isHotkey from 'is-hotkey';
import Default from './default';
class Left extends Default {
	hotkey = (event: KeyboardEvent) =>
		isHotkey('left', event) ||
		isHotkey('shift+left', event) ||
		isHotkey('ctrl+a', event) ||
		isHotkey('ctrl+b', event);
}
export default Left;
