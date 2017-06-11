'use strict';

export const EVENTS = {
	INPUT: {
		KEYBIND: 'keybind'
	}
};

export default class ObserverInput {
	constructor(eventEmitter) {
		this._eventEmitter = eventEmitter;

		document.addEventListener('keyup', this._onKeyPress.bind(this));
	}

	_onKeyPress(e) {
		if (!ObserverInput._isTextInput(e.target)) {
			// console.log(e);
			const keybind = ObserverInput.getKeyBindFromEvent(e);
			if (keybind) {
				this._eventEmitter.emit(EVENTS.INPUT.KEYBIND, keybind, e);
			}
		}
	}

	static getKeyBindFromEvent(e) {
		const keyMatch = e.code.match(/^key([A-z]+)/i);
		if (!keyMatch) {
			return null;
		}
		// Use undefined instead of false to reduce size of settings in localStorage
		return {
			key: keyMatch[1].toLowerCase(),
			ctrl: e.ctrlKey ? true : undefined,
			shift: e.shiftKey ? true : undefined,
			alt: e.altKey ? true : undefined,
			meta: e.metaKey ? true : undefined
		};
	}

	static _isTextInput(node) {
		if (node.nodeName === 'INPUT') {
			return true;
		}
		if (node.nodeName === 'TEXTAREA') {
			return true;
		}
		if (node.classList.contains('chatInput')) {
			return true;
		}
		if (node.classList.contains('fieldEditor')) {
			return true;
		}
		return false;
	}
}
