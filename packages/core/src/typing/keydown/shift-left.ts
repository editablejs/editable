import Default from './default';

class ShiftLeft extends Default {
	hotkey = 'shift+left'

	emit(): boolean | void {
    const { selection } = this.editor;
		selection.moveFocusToBackward();
	}
}
export default ShiftLeft;
