import isHotkey from 'is-hotkey';
import DefaultKeydown from './default';

class Right extends DefaultKeydown {
	hotkey = (event: KeyboardEvent) =>
		isHotkey('right', event) ||
		isHotkey('shift+right', event) ||
		isHotkey('ctrl+e', event) ||
		isHotkey('ctrl+f', event);
}
export default Right;
