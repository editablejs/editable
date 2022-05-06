import { ITypingHandle } from '../types';
import DefaultKeydown from './default';

class Backspace extends DefaultKeydown implements ITypingHandle {
	hotkey = 'backspace';

	emit() {
		this.editor.deleteBackward()
	}
}

export default Backspace;
