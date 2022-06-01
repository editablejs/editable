import isHotkey from 'is-hotkey';
import Default from './default';
class Left extends Default {
	hotkey = (event: KeyboardEvent) =>
		isHotkey('left', event)

	emit(): boolean | void {
		this.editor.selection.moveToBackward();
	}
}
export default Left;
