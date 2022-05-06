import DefaultKeydown from '../keydown/default';
import { TypingEventType } from '../types';

class DefaultKeyup extends DefaultKeydown {
	type: TypingEventType = 'keyup';
}

export default DefaultKeyup;
