import DefaultKeydown from './default';

class Right extends DefaultKeydown {
	hotkey = 'right'

		emit(): boolean | void {
			this.editor.selection.moveToForward();
		}
}
export default Right;
