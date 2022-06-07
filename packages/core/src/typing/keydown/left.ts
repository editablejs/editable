import Default from './default';
class Left extends Default {
	hotkey = 'left'

	emit(): boolean | void {
		this.editor.selection.moveToBackward();
	}
}
export default Left;
