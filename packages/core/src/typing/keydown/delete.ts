import DefaultKeydown from './default';

class Delete extends DefaultKeydown {
	hotkey = 'delete';
	
	emit() {
		this.editor.change.deleteForward()
	}
}
export default Delete;
