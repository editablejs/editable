import type { IEventEmitter } from "@editablejs/event-emitter";
import type { IEditor } from "../types";

export type TypingEventListener = (event: KeyboardEvent) => boolean | void;

export interface TypingHandleConstructor {
	prototype: ITypingHandle;
	new (editor: IEditor): ITypingHandle;
}

export interface TypingListener {
	name: string;
	emitName?: string;
	handle: TypingHandleConstructor;
	emitParams?:
		| any
		| ((editor: IEditor, event: KeyboardEvent) => any);
}

export interface ITypingHandle {

	listeners: TypingEventListener[];

	type: TypingEventType;

	hotkey: string[] | string | ((event: KeyboardEvent) => boolean);

	on(listener: TypingEventListener): void;

	off(listener: TypingEventListener): void;

	emit(event: KeyboardEvent): boolean | void;

	destroy(): void;
}

export type TypingEventType = 'keydown' | 'keyup';

export interface ITyping extends IEventEmitter {

  addHandleListener(listener: TypingListener): void

	getHandleListener(
		name: string,
		type: TypingEventType,
	): ITypingHandle | undefined

	removeHandleListener(name: string, type: TypingEventType): void

  emitKeydown(event: KeyboardEvent): void

  emitKeyup(event: KeyboardEvent): void
}