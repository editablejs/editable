import DefaultKeydown from './default';

class Delete extends DefaultKeydown {
	hotkey = 'delete';
	
	emit() {
		this.editor.deleteForward()
	}
}
export default Delete;
