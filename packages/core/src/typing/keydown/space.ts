import Default from './default';

class Space extends Default {
	hotkey = (event: KeyboardEvent) => {
		return event.key === ' ';
	};
}
export default Space;
