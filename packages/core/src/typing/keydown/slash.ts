import isHotkey from 'is-hotkey';
import Default from './default';

class Slash extends Default {
	hotkey = (event: KeyboardEvent) =>
		event.key === '/' ||
		isHotkey('/', event) ||
		(event.keyCode === 229 && event.code === 'Slash');
}
export default Slash;
