import DefaultKeydown from './default';

class ShiftRight extends DefaultKeydown {
	hotkey = 'shift+right'

  emit(): boolean | void {
    const { selection } = this.editor;
    selection.moveFocusToForward();
  }
}
export default ShiftRight;
