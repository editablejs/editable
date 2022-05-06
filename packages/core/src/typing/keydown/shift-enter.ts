import DefaultKeydown from './default';

class ShitEnter extends DefaultKeydown {
	hotkey: string | string[] | ((event: KeyboardEvent) => boolean) =
		'shift+enter';
}

export default ShitEnter;
