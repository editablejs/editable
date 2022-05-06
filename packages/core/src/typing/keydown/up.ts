import isHotkey from 'is-hotkey';
import Default from './default';

class Up extends Default {
	hotkey = (event: KeyboardEvent) =>
		isHotkey('up', event) || isHotkey('ctrl+p', event);
}
export default Up;
