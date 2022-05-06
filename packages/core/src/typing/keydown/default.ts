import { IEditor } from "../../types";
import { TypingEventListener, ITypingHandle, TypingEventType } from "../types";


class DefaultKeydown implements ITypingHandle {
	type: TypingEventType = 'keydown';
	hotkey: string | string[] | ((event: KeyboardEvent) => boolean) = '';
	listeners: TypingEventListener[] = [];
	editor: IEditor

	constructor(editor: IEditor) {
		this.editor = editor
	}

	on(listener: TypingEventListener) {
		this.listeners.push(listener);
	}

	off(listener: TypingEventListener) {
		for (let i = 0; i < this.listeners.length; i++) {
			if (this.listeners[i] === listener) {
				this.listeners.splice(i, 1);
				break;
			}
		}
	}

	emit(event: KeyboardEvent): boolean | void {
    const r = this.listeners.some(fn => {
      const result = fn(event);
      if(result === false) return true;
      return false
    })
    if(r) return false;
	}

	destroy() {
		this.listeners = [];
	}
}

export default DefaultKeydown;
