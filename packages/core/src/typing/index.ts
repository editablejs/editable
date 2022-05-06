import EventEmitter from "@editablejs/event-emitter"
import isHotkey from "is-hotkey";
import { IEditor } from "../types";
import type { ITyping, TypingEventType } from './types'
import { TypingListener, ITypingHandle } from "./types";
import keydownDefaultHandles from './keydown';
import keyupDefaultHandles from './keyup';

export default class Typing extends EventEmitter implements ITyping {
  private handleListeners: (Omit<TypingListener, 'handle'> & Record<'handle', ITypingHandle>) [] = [];
  protected containers: HTMLElement[] = []
  protected editor: IEditor

  constructor(editor: IEditor) { 
    super()
    this.editor = editor
    keydownDefaultHandles.concat(keyupDefaultHandles).forEach((handle) => {
			this.addHandleListener(handle);
		});
  }
  
  addHandleListener({ name, handle, emitName, emitParams}: TypingListener): void {
		this.handleListeners.push({
			name,
			handle: new handle(this.editor),
			emitName,
			emitParams,
		});
	}

	getHandleListener(
		name: string,
		type: TypingEventType,
	): ITypingHandle | undefined {
		return this.handleListeners.find(
			(listener) =>
				listener.name === name && listener.handle.type === type,
		)?.handle;
	}

	removeHandleListener(name: string, type: TypingEventType): void {
		for (let i = 0; i < this.handleListeners.length; i++) {
			if (
				this.handleListeners[i].name === name &&
				this.handleListeners[i].handle.type === type
			) {
				this.handleListeners[i].handle.destroy();
				this.handleListeners.splice(i, 1);
				break;
			}
		}
	}

	emitKeydown = (event: KeyboardEvent) => {
		this.emitKeyboardEvent('keydown', event);
	};

	emitKeyup = (event: KeyboardEvent) => {
		this.emitKeyboardEvent('keyup', event);
	};

	emitKeyboardEvent(type: 'keydown' | 'keyup', event: KeyboardEvent) {
		//循环事件
		const result = this.handleListeners
			.filter(({ handle }) => handle.type === type)
			.some((listener) => {
				const { name, handle, emitName, emitParams } = listener;
				if (name === 'default' || !!!handle.hotkey) return false;
				if (
					typeof handle.hotkey === 'function'
						? handle.hotkey(event)
						: isHotkey(handle.hotkey, event)
				) {
					let params = [event];
					if (typeof emitParams === 'function')
						params = emitParams(this.editor, event);
					if (
						!emitName || this.editor.emit(emitName, ...params) !== false
					) {
						handle.emit(event);
					}
					return true;
				}
				return false;
			});
		//触发默认事件
		if (result === false) {
			this.getHandleListener('default', type)?.emit(event);
		}
	}

  destroy(): void {
    this.removeAll()
  }
}