import isHotkey from 'is-hotkey';
import Default from './default';

class Down extends Default {
	hotkey = (event: KeyboardEvent) =>
		isHotkey('down', event) || isHotkey('ctrl+n', event);
}
export default Down;
